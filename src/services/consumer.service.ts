import { config } from "@/config";
import TYPES from "@/config/inversify/types";
import { KafkaConsumerGroups } from "@/libs/kafka/kafkaConsumerGroups";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ICustomCodeResult } from "@/dtos/CustomCodeRestults.dto";
import { IRunCodeResult } from "@/dtos/RunCodeResults.dto";
import { ISubmissionResult } from "@/dtos/SubmissionResults.dto";
import { IGrpcProblemService } from "@/infra/grpc/ProblemService.interface";
import { KafkaManager } from "@/libs/kafka/kafkaManager";
import { KafkaTopics } from "@/libs/kafka/kafkaTopics";
import { ICacheProvider } from "@/providers/ICacheProvider.interface";
import logger from "@/utils/pinoLogger";
import { inject, injectable } from "inversify";
import { IConsumerService } from "./interface/consumer.service.interface";

/**
 * Class responsible for consuming messages from Kafka topics.
 * Handles retries and dead-letter queue processing.
 * * @class
 * @implements {IConsumerService}
 */
@injectable()
export class ConsumerService implements IConsumerService {

    #_kafkaManager : KafkaManager
    #_cacheProvider : ICacheProvider
    #_problemGrpcClient : IGrpcProblemService

    constructor(
        @inject(TYPES.KafkaManager)
        kafkaManager : KafkaManager,

        @inject(TYPES.ICacheProvider)
        cacheProvider : ICacheProvider,

        @inject(TYPES.IGrpcProblemService)
        problemGrpcClient : IGrpcProblemService
    ){
        this.#_kafkaManager = kafkaManager;
        this.#_cacheProvider = cacheProvider;
        this.#_problemGrpcClient = problemGrpcClient;
    } 

    async submitCodeExec() : Promise<void> {
        const topic = KafkaTopics.SUBMISSION_RESULTS;
        const group = KafkaConsumerGroups.CM_SUB_NORMAL_RESULT;
        logger.info(`[CONSUMER] Setting up consumer for topic: ${topic} with group: ${group}`);

        await this.#_kafkaManager.createConsumer(
            group,
            topic,
            async (data : ISubmissionResult) => {
                const method = 'submitCodeExec';
                const submissionId = data.submissionId;
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY_SUBMIT_CODE}:${submissionId}`;
                logger.info(`[CONSUMER] ${method}: Received result`, { submissionId});

                try {
                    // Idempotency Check
                    const alreadyProcessed = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyProcessed){
                        logger.warn(`[CONSUMER] ${method}: Idempotency key found. Skipping processing.`, { submissionId });
                        return;
                    }
                    logger.debug(`[CONSUMER] ${method}: Idempotency check passed. Processing submission.`, { submissionId });
                    
                    const finalStatus = data.executionResult.stats?.totalTestCase === data.executionResult.stats?.passedTestCase ? 'accepted' : 'failed';
                    
                    // 1. Cache the result
                    const cacheKey = `${REDIS_PREFIX.SUBMISSION_NORMAL_CACHE}:${submissionId}`;
                    await this.#_cacheProvider.set(
                         cacheKey,
                         data,
                         config.SUBMISSION_DETAILS_CACHE_EXPIRY
                    )
                    logger.debug(`[CONSUMER] ${method}: Result cached.`, { submissionId });

                    // 2. Update Submission via gRPC
                    await this.#_problemGrpcClient.updateSubmission({
                        ...data,
                        status : finalStatus,
                        Id: submissionId,
                        executionResult : {
                            failedTestCase : data.executionResult.failedTestCase ? data.executionResult.failedTestCase : undefined,
                            stats : data.executionResult.stats ? {
                                totalTestCase :  data.executionResult.stats?.totalTestCase!,
                                failedTestCase : data.executionResult.stats.failedTestCase!,
                                passedTestCase : data.executionResult.stats.passedTestCase!,
                                executionTimeMs : data.executionResult.stats.executionTimeMs!,
                                memoryMB : data.executionResult.stats.memoryMB!
                            } : undefined
                        }
                    });
                    logger.info(`[CONSUMER] ${method}: Submission updated via gRPC. Status: ${finalStatus}`, { submissionId });

                    // 3. Set Idempotency Key
                    await this.#_cacheProvider.set(
                        idempotencyKey,
                        '1', 
                        config.KAFKA_IDEMPOTENCY_KEY_EXPIRY
                    ); 
                    logger.debug(`[CONSUMER] ${method}: Idempotency key set.`, { submissionId });

                } catch (error) {
                    logger.error(`[CONSUMER] ${method}: Error processing submission result. Throwing to trigger retry logic.`, { submissionId, error });
                    // Re-throw the error to trigger the Kafka retry mechanism
                    throw error;
                }
            }
        );
    }

    async runCodeExec () : Promise<void> {
        const topic = KafkaTopics.RUN_RESULTS;
        const group = KafkaConsumerGroups.CM_RUN_NORMAL_RESULT;
        logger.info(`[CONSUMER] Setting up consumer for topic: ${topic} with group: ${group}`);

        await this.#_kafkaManager.createConsumer(
            group,
            topic,
            async (data : IRunCodeResult) => {
                const method = 'runCodeExec';
                const tempId = data.tempId;
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY_RUN_CODE}:${tempId}`;
                logger.info(`[CONSUMER] ${method}: Received result`, { tempId });

                try {
                    // Idempotency Check
                    const alreadyProcessed = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyProcessed){
                        logger.warn(`[CONSUMER] ${method}: Idempotency key found. Skipping processing.`, { tempId });
                        return;
                    }
                    logger.debug(`[CONSUMER] ${method}: Idempotency check passed. Processing run result.`, { tempId });

                    // 1. Cache the result
                    const cacheKey = `${REDIS_PREFIX.RUN_CODE_NORMAL_CACHE}:${tempId}`;
                    await this.#_cacheProvider.set(
                         cacheKey,
                         data,
                         config.SUBMISSION_DETAILS_CACHE_EXPIRY
                    );
                    logger.debug(`[CONSUMER] ${method}: Result cached.`, { tempId });

                    // 2. Set Idempotency Key
                    await this.#_cacheProvider.set(
                        idempotencyKey, 
                        "1", 
                        config.KAFKA_IDEMPOTENCY_KEY_EXPIRY
                    );
                    logger.debug(`[CONSUMER] ${method}: Idempotency key set.`, { tempId });

                } catch (error) {
                    logger.error(`[CONSUMER] ${method}: Error processing run result. Throwing to trigger retry logic.`, { tempId, error });
                    // Re-throw the error to trigger the Kafka retry mechanism
                    throw error;
                }
            }
        )
    }

    async customCodeExec () : Promise<void> {
        const topic = KafkaTopics.CUSTOM_RESULTS;
        const group = KafkaConsumerGroups.CM_CUSTOM_NORMAL_RESULT;
        logger.info(`[CONSUMER] Setting up consumer for topic: ${topic} with group: ${group}`);

        await this.#_kafkaManager.createConsumer(
            group,
            topic,
            async (data : ICustomCodeResult) => {
                const method = 'customCodeExec';
                const tempId = data.tempId;
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY_CUSTOM_CODE}:${tempId}`;
                logger.info(`[CONSUMER] ${method}: Received result`, { tempId });

                try { 
                    // Idempotency Check
                    const alreadyProcessed = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyProcessed){
                        logger.warn(`[CONSUMER] ${method}: Idempotency key found. Skipping processing.`, { tempId });
                        return;
                    }
                    logger.debug(`[CONSUMER] ${method}: Idempotency check passed. Processing custom code result.`, { tempId });

                    // 1. Cache the result
                    const cacheKey = `${REDIS_PREFIX.CUSTOM_CODE_NORMAL_CACHE}:${data.tempId}`;
                    await this.#_cacheProvider.set(
                         cacheKey,
                         data,
                         config.RUN_CODE_DETAILS_CACHE_EXPIRY
                    );
                    logger.debug(`[CONSUMER] ${method}: Result cached.`, { tempId });

                    // 2. Set Idempotency Key
                    await this.#_cacheProvider.set(
                        idempotencyKey, 
                        "1", 
                        config.KAFKA_IDEMPOTENCY_KEY_EXPIRY
                    );
                    logger.debug(`[CONSUMER] ${method}: Idempotency key set.`, { tempId });

                } catch (error) {
                    logger.error(`[CONSUMER] ${method}: Error processing custom code result. Throwing to trigger retry logic.`, { tempId, error });
                    // Re-throw the error to trigger the Kafka retry mechanism
                    throw error;
                }
            }
        )
    }
}