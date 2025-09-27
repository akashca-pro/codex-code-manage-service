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
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { inject, injectable } from "inversify";
import { IConsumerService } from "./interface/consumer.service.interface";

/**
 * Class responsible for consuming messages from Kafka topics.
 * Handles retries and dead-letter queue processing.
 * 
 * @class
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
        await this.#_kafkaManager.createConsumer(
            KafkaConsumerGroups.CM_SUB_NORMAL_RESULT,
            KafkaTopics.SUBMISSION_RESULTS,
            async (data : ISubmissionResult) => {
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY_SUBMIT_CODE}:${data.submissionId}`;
                try {
                    const alreadyProcessed = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyProcessed){
                        return;
                    }
                    const cacheKey = `${REDIS_PREFIX.SUBMISSION_NORMAL_CACHE}:${data.submissionId}`;
                    await this.#_cacheProvider.set(
                         cacheKey,
                         data,
                         config.SUBMISSION_DETAILS_CACHE_EXPIRY
                    )
                    await this.#_problemGrpcClient.updateSubmission({
                        ...data,
                        status : data.executionResult.stats?.totalTestCase === data.executionResult.stats?.passedTestCase ? 'accepted' : 'failed',
                        Id: data.submissionId,
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
                    await this.#_cacheProvider.set(
                        idempotencyKey,
                        '1', 
                        config.KAFKA_IDEMPOTENCY_KEY_EXPIRY
                    ); 
                } catch (error) {
                    logger.error('Error processing submission result from Kafka:', error);
                    throw error;
                }
            }
        );
    }

    async runCodeExec () : Promise<void> {
        await this.#_kafkaManager.createConsumer(
            KafkaConsumerGroups.CM_RUN_NORMAL_RESULT,
            KafkaTopics.RUN_RESULTS,
            async (data : IRunCodeResult) => {
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY_RUN_CODE}:${data.tempId}`;
                try {
                    const alreadyProcessed = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyProcessed){
                        return;
                    }
                    const cacheKey = `${REDIS_PREFIX.RUN_CODE_NORMAL_CACHE}:${data.tempId}`;
                    await this.#_cacheProvider.set(
                         cacheKey,
                         data,
                         config.SUBMISSION_DETAILS_CACHE_EXPIRY
                    );
                    await this.#_cacheProvider.set(
                        idempotencyKey, 
                        "1", 
                        config.KAFKA_IDEMPOTENCY_KEY_EXPIRY
                    );
                } catch (error) {
                    logger.error('Error processing submission result from Kafka:', error);
                    throw error;
                }
            }
        )
    }

    async customCodeExec () : Promise<void> {
        await this.#_kafkaManager.createConsumer(
            KafkaConsumerGroups.CM_CUSTOM_NORMAL_RESULT,
            KafkaTopics.CUSTOM_RESULTS,
            async (data : ICustomCodeResult) => {
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY_CUSTOM_CODE}:${data.tempId}`;
                try { 
                    const alreadyProcessed = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyProcessed){
                        return;
                    }
                    const cacheKey = `${REDIS_PREFIX.CUSTOM_CODE_NORMAL_CACHE}:${data.tempId}`;
                    await this.#_cacheProvider.set(
                         cacheKey,
                         data,
                         config.RUN_CODE_DETAILS_CACHE_EXPIRY
                    );
                    await this.#_cacheProvider.set(
                        idempotencyKey, 
                        "1", 
                        config.KAFKA_IDEMPOTENCY_KEY_EXPIRY
                    );
                } catch (error) {
                    logger.error('Error processing submission result from Kafka:', error);
                    throw error;
                }
            }
        )
    }
}