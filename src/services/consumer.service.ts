import { config } from "@/config";
import TYPES from "@/config/inversify/types";
import { KafkaConsumerGroups } from "@/config/nats/kafkaConsumerGroups";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ICustomCodeResult } from "@/dtos/CustomCodeRestults.dto";
import { IRunCodeResult } from "@/dtos/RunCodeResults.dto";
import { ISubmissionResult } from "@/dtos/SubmissionResults.dto";
import { IGrpcProblemService } from "@/infra/grpc/ProblemService.interface";
import { KafkaManager } from "@/libs/kafka/kafkaManager";
import { KafkaTopics } from "@/libs/kafka/kafkaTopics";
import { ICacheProvider } from "@/providers/cacheProvider/ICacheProvider.interface";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { inject, injectable } from "inversify";

/**
 * Class responsible for consuming messages from Kafka topics.
 * Handles retries and dead-letter queue processing.
 * 
 * @class
 */
@injectable()
export class ConsumerService {

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
            KafkaConsumerGroups.CM_SUB_NORMAL_EXEC,
            KafkaTopics.SUBMISSION_RESULTS,
            async (data : ISubmissionResult) => {
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY}:${data.submissionId}`;
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
                    );

                    await this.#_problemGrpcClient.updateSubmission({
                        ...data,
                        Id: data.problemId,
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
            KafkaConsumerGroups.CM_RUN_NORMAL_EXEC,
            KafkaTopics.RUN_JOBS,
            async (data : IRunCodeResult) => {
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY}:${data.userId}`;
                try {
                    const alreadyProcessed = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyProcessed){
                        return;
                    }

                    const cacheKey = `${REDIS_PREFIX.RUN_CODE_NORMAL_CACHE}:${data.userId}`;
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
            KafkaConsumerGroups.CM_CUSTOM_NORMAL_EXEC,
            KafkaTopics.CUSTOM_JOBS,
            async (data : ICustomCodeResult) => {
                const idempotencyKey = `${REDIS_PREFIX.KAFKA_IDEMPOTENCY_KEY}:${data.tempId}`;
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