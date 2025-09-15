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
import { SubmitCodeExecRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/internal/code_manage";
import { inject, injectable } from "inversify";
import { IProducerService } from "./interface/producer.service.interface";
import { ICacheProvider } from "@/providers/ICacheProvider.interface";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { Problem } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { config } from "@/config";

/**
 * Class responsible for producing messages to Kafka topics.
 * Handles code submission, execution requests, and custom code execution.
 * 
 * @class
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

        const language = Mapper.mapGrpcLanguageEnum(data.language)

        const { isValid, error } = this.#_sanitizer.sanitize(data.userCode,language);

        if(!isValid){
            return {
                data : null,
                success : false,
                errorMessage : error
            }
        }

        let problem : Problem | null = null;

        const cachKey = `${REDIS_PREFIX.PROBLEM_DETAILS}:${data.problemId}`;

        const cached = await this.#_cacheProvider.get(cachKey);

        if(cached){
            problem = cached as Problem;
        }else{
            problem = await this.#_problemGrpcClient.getProblem({ Id : data.problemId });
            if(problem){
                await this.#_cacheProvider.set(cachKey, problem, config.PROBLEM_DETAILS_CACHE_EXPIRY);
            }
        }
        
        if(!problem){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const submission = await this.#_problemGrpcClient.createSubmission(
            SubmissionMapper.toCreateSubmissionDTO(
                data, 
                { title : problem.title, difficulty : problem.difficulty }
            )
        );

        const jobPayload = {
            submissionId : submission.Id,
            userCode : data.userCode,
            language : data.language,
            userId : data.userId,
            testCases : problem.testcaseCollection?.submit
        }

        await this.#_kafkaManager.sendMessage(
            KafkaTopics.SUBMISSION_JOBS,
            jobPayload.submissionId,
            jobPayload
        );

        return {
            data : submission.Id,
            success : true
        }
    }

    async runCodeExec(data : IRunCodeExecRequestDTO) : Promise<ResponseDTO> {

        const language = Mapper.mapGrpcLanguageEnum(data.language)

        const { isValid, error } = this.#_sanitizer.sanitize(data.userCode,language);

        if(!isValid){
            return {
                data : null,
                success : false,
                errorMessage : error
            }
        }
        
        let problem : Problem | null = null;

        const cachKey = `${REDIS_PREFIX.PROBLEM_DETAILS}:${data.problemId}`;

        const cached = await this.#_cacheProvider.get(cachKey);

        if(cached){
            problem = cached as Problem | null ;
        }else{
            problem = await this.#_problemGrpcClient.getProblem({ Id : data.problemId });
            if(problem){
                await this.#_cacheProvider.set(cachKey, problem, config.PROBLEM_DETAILS_CACHE_EXPIRY);
            }
        }
        
        if(!problem){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

         const jobPayload = {
            ...data,
            language
        };

        await this.#_kafkaManager.sendMessage(
            data.userId,
            KafkaTopics.RUN_JOBS,
            jobPayload
        );

        return {
            data : null,
            success : true
        }
    }

    async customCodeExec(data : ICustomCodeExecRequestDTO) : Promise<ResponseDTO> {

        const language = Mapper.mapGrpcLanguageEnum(data.language)

        const { isValid, error } = this.#_sanitizer.sanitize(data.userCode,language);

        if(!isValid){
            return {
                data : null,
                success : false,
                errorMessage : error
            }
        }

        await this.#_kafkaManager.sendMessage(
            data.tempId,
            KafkaTopics.CUSTOM_JOBS,
            data
        );

        return {
            data : null,
            success : true,
        }
    }
}