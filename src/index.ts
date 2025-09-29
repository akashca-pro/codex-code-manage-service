import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { config } from '@/config';
import { startMetricsServer } from '@/config/metrics/metrics-server';
import { startGrpcServer } from './transport/grpc/server';
import container from './config/inversify/container';
import TYPES from './config/inversify/types';
import { KafkaManager } from './libs/kafka/kafkaManager';
import { KafkaTopics } from './libs/kafka/kafkaTopics';
import { ConsumerService } from './services/consumer.service';

const startServer = async () => {
    try {
        const kafkaManager = container.get<KafkaManager>(TYPES.KafkaManager);
        
        // kafka core setup
        await kafkaManager.init();

        // // create topics
        await kafkaManager.createTopic(KafkaTopics.SUBMISSION_JOBS);
        await kafkaManager.createTopic(KafkaTopics.SUBMISSION_RESULTS);
        await kafkaManager.createTopic(KafkaTopics.RUN_JOBS);
        await kafkaManager.createTopic(KafkaTopics.RUN_RESULTS);
        await kafkaManager.createTopic(KafkaTopics.CUSTOM_JOBS);
        await kafkaManager.createTopic(KafkaTopics.CUSTOM_RESULTS);

        // // start consumers
        const consumerService = container.get<ConsumerService>(TYPES.IConsumerService);
        await consumerService.submitCodeExec();
        await consumerService.runCodeExec();
        await consumerService.customCodeExec();

        // Start prometheus metrics server.
        startMetricsServer(config.METRICS_PORT);

        // start gRPC server.
        startGrpcServer();

    } catch (error) {
        logger.error('Failed to start server : ',error);
        process.exit(1);
    }
}

startServer().catch((err)=>{
    logger.error(`Fatal startup error:`, err);
    process.exit(1);
});