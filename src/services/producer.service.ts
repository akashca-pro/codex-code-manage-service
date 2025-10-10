import TYPES from "@/config/inversify/types";
import { KafkaTopics } from "@/libs/kafka/kafkaTopics";
import { ICustomCodeExecRequestDTO } from "@/dtos/CompileCodeExec.dto";
import { SubmissionMapper } from "@/dtos/mappers/SubmissionMapper";
import { ResponseDTO } from "@/dtos/Response.dto";
import { IRunCodeExecRequestDTO } from "@/dtos/RunCodeExec.dto";
import { ProblemErrorType } from "@/enums/Error/ProblemServiceErrorType.enum";
import { Mapper } from "@/enums/Mapper";
import { IGrpcProblemService } from "@/infra/grpc/ProblemService.interface";
import { KafkaManager } from "@/libs/kafka/kafkaManager";
import { CodeSanitizer } from "@/utils/codeSanitize";
import { SubmitCodeExecRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/code_manage";
import { inject, injectable } from "inversify";
import { IProducerService } from "./interface/producer.service.interface";
import { ICacheProvider } from "@/providers/ICacheProvider.interface";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { Problem } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { config } from "@/config";
import { ICustomCodeExecJobPayload, IRunCodeExecJobPayload, ISubmissionExecJobPayload } from "@/libs/kafka/interfaces/jobPayload.interface";
import { populateTemplate } from "@/utils/populateTemplate";
import { randomUUID } from "node:crypto";
import logger from '@/utils/pinoLogger'; // Import the logger

/**
 * Class responsible for producing messages to Kafka topics.
 * Handles code submission, execution requests, and custom code execution.
 * * @class
 * @implements {IProducerService}
 */
@injectable()
export class ProducerService implements IProducerService {

    #_kafkaManager : KafkaManager
    #_sanitizer : CodeSanitizer
    #_problemGrpcClient : IGrpcProblemService
    #_cacheProvider : ICacheProvider

    constructor(
        @inject(TYPES.KafkaManager)
        kafkaManager : KafkaManager,

        @inject(TYPES.IGrpcProblemService)
        problemGrpcClient : IGrpcProblemService,

        @inject(TYPES.CodeSanitizer)
        sanitizer : CodeSanitizer,

        @inject(TYPES.ICacheProvider)
        cacheProvider : ICacheProvider
    ){
        this.#_kafkaManager = kafkaManager;
        this.#_problemGrpcClient = problemGrpcClient;
        this.#_sanitizer = sanitizer;
        this.#_cacheProvider = cacheProvider;
    }

    async submitCodeExec(data : SubmitCodeExecRequest) : Promise<ResponseDTO> {
        const method = 'submitCodeExec';
        logger.info(`[PRODUCER-SERVICE] ${method} started`, { problemId: data.problemId, userId: data.userId, language: data.language });
        
        const language = Mapper.mapGrpcLanguageEnum(data.language)
        
        // 1. Code Sanitization
        const { isValid, error } = this.#_sanitizer.sanitize(data.userCode,language);
        if(!isValid){
            logger.warn(`[PRODUCER-SERVICE] ${method} failed: Code sanitization failed.`, { problemId: data.problemId, userId: data.userId, error });
            return {
                data : null,
                success : false,
                errorMessage : error
            }
        }
        logger.debug(`[PRODUCER-SERVICE] ${method}: Code sanitized successfully.`);

        // 2. Problem Detail Retrieval (with Cache)
        let problem : Problem | null = null;
        const cachKey = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}:${data.problemId}`;
        const cached = await this.#_cacheProvider.get(cachKey);
        
        if(cached){
            problem = cached as Problem;
            logger.debug(`[PRODUCER-SERVICE] ${method}: Problem details cache hit.`, { problemId: data.problemId });
        }else{
            logger.debug(`[PRODUCER-SERVICE] ${method}: Problem details cache miss. Fetching via gRPC.`, { problemId: data.problemId });
            problem = await this.#_problemGrpcClient.getProblem({ Id : data.problemId });
            if(problem){
                await this.#_cacheProvider.set(cachKey, problem, config.PROBLEM_DETAILS_CACHE_EXPIRY);
                logger.debug(`[PRODUCER-SERVICE] ${method}: Problem details fetched and cached.`, { problemId: data.problemId });
            }
        }
        
        if(!problem || 
            !problem.testcaseCollection ||
            !problem.testcaseCollection.submit ||
            problem.testcaseCollection.submit.length === 0){
            logger.warn(`[PRODUCER-SERVICE] ${method} failed: Problem or test cases not found/available.`, { problemId: data.problemId });
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        // 3. Create Submission via gRPC
        const createSubmissionData = SubmissionMapper.toCreateSubmissionDTO(
            data, 
            { title : problem.title, difficulty : problem.difficulty }
        )
        const submission = await this.#_problemGrpcClient.createSubmission(createSubmissionData);
        logger.info(`[PRODUCER-SERVICE] ${method}: Submission created via gRPC.`, { submissionId: submission.Id });
        
        // 4. Check Template Code
        const templateCode = problem.templateCodes.find(t=>t.language === data.language);
        if(!templateCode || !templateCode.submitWrapperCode){
            logger.warn(`[PRODUCER-SERVICE] ${method} failed: Submission template code not found for language: ${data.language}.`, { problemId: data.problemId });
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        // 5. Populate Template
        const executableCode = populateTemplate(
            language,
            JSON.parse(templateCode.submitWrapperCode),
            JSON.parse(data.userCode),
            problem.testcaseCollection.submit
        )
        logger.debug(`[PRODUCER-SERVICE] ${method}: Executable code template populated.`);

        // 6. Produce Kafka Message
        const jobPayload : ISubmissionExecJobPayload = {
            submissionId : submission.Id,
            executableCode,
            language : language,
            userId : data.userId,
            testCases :  problem.testcaseCollection?.submit,
        }
        await this.#_kafkaManager.sendMessage(
            KafkaTopics.SUBMISSION_JOBS,
            jobPayload.submissionId,
            jobPayload
        );
        logger.info(`[PRODUCER-SERVICE] ${method} completed successfully. Message produced to ${KafkaTopics.SUBMISSION_JOBS}`, { submissionId: submission.Id });

        return {
            data : { submissionId : submission.Id },
            success : true
        }
    }

    async runCodeExec(data : IRunCodeExecRequestDTO) : Promise<ResponseDTO> {
        const method = 'runCodeExec';
        const language = Mapper.mapGrpcLanguageEnum(data.language);
        const tempId = randomUUID();
        logger.info(`[PRODUCER-SERVICE] ${method} started`, { problemId: data.problemId, tempId, language: data.language });
        
        // 1. Code Sanitization
        const { isValid, error } = this.#_sanitizer.sanitize(data.userCode,language);
        if(!isValid){
            logger.warn(`[PRODUCER-SERVICE] ${method} failed: Code sanitization failed.`, { problemId: data.problemId, tempId, error });
            return {
                data : null,
                success : false,
                errorMessage : error
            }
        }
        logger.debug(`[PRODUCER-SERVICE] ${method}: Code sanitized successfully.`);

        // 2. Problem Detail Retrieval (with Cache)
        let problem : Problem | null = null;
        const cachKey = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}:${data.problemId}`;
        const cached = await this.#_cacheProvider.get(cachKey);
        
        if(cached){
            problem = cached as Problem | null ;
            logger.debug(`[PRODUCER-SERVICE] ${method}: Problem details cache hit.`, { problemId: data.problemId });
        }else{
            logger.debug(`[PRODUCER-SERVICE] ${method}: Problem details cache miss. Fetching via gRPC.`, { problemId: data.problemId });
            problem = await this.#_problemGrpcClient.getProblem({ Id : data.problemId });
            if(problem){
                await this.#_cacheProvider.set(cachKey, problem, config.PROBLEM_DETAILS_CACHE_EXPIRY);
                logger.debug(`[PRODUCER-SERVICE] ${method}: Problem details fetched and cached.`, { problemId: data.problemId });
            }
        }
        
        if(!problem){
            logger.warn(`[PRODUCER-SERVICE] ${method} failed: Problem not found.`, { problemId: data.problemId });
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }
        
        // 3. Check Template Code
        const templateCode = problem.templateCodes.find(t=>t.language === data.language);
        if(!templateCode || !templateCode.runWrapperCode){
            logger.warn(`[PRODUCER-SERVICE] ${method} failed: Run template code not found for language: ${data.language}.`, { problemId: data.problemId });
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }
        
        // 4. Populate Template
        const executableCode = populateTemplate(
            language,
            JSON.parse(templateCode.runWrapperCode),
            JSON.parse(data.userCode),
            data.testCases
        )
        logger.debug(`[PRODUCER-SERVICE] ${method}: Executable code template populated.`);

        // 5. Produce Kafka Message
        const jobPayload : IRunCodeExecJobPayload = {
            ...data,
            tempId,
            executableCode,
            language
        };
        await this.#_kafkaManager.sendMessage(
            KafkaTopics.RUN_JOBS,
            tempId,
            jobPayload
        );
        logger.info(`[PRODUCER-SERVICE] ${method} completed successfully. Message produced to ${KafkaTopics.RUN_JOBS}`, { tempId });

        return {
            data : {tempId},
            success : true
        }
    }

    async customCodeExec(data : ICustomCodeExecRequestDTO) : Promise<ResponseDTO> {
        const method = 'customCodeExec';
        const language = Mapper.mapGrpcLanguageEnum(data.language);
        const tempId = randomUUID();
        logger.info(`[PRODUCER-SERVICE] ${method} started`, { tempId, language: data.language });
        
        // 1. Code Sanitization
        const { isValid, error } = this.#_sanitizer.sanitize(data.userCode,language);
        if(!isValid){
            logger.warn(`[PRODUCER-SERVICE] ${method} failed: Code sanitization failed.`, { tempId, error });
            return {
                data : null,
                success : false,
                errorMessage : error
            }
        }
        logger.debug(`[PRODUCER-SERVICE] ${method}: Code sanitized successfully.`);

        // 2. Produce Kafka Message
        const jobPayload : ICustomCodeExecJobPayload = {
            language,
            tempId,
            userCode : data.userCode,
        }
        await this.#_kafkaManager.sendMessage(
            KafkaTopics.CUSTOM_JOBS,
            tempId,
            jobPayload
        );
        logger.info(`[PRODUCER-SERVICE] ${method} completed successfully. Message produced to ${KafkaTopics.CUSTOM_JOBS}`, { tempId });
        
        return {
            data : {tempId},
            success : true,
        }
    }
}