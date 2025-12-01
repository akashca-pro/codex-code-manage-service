import './config/tracing'
import logger from '@/utils/pinoLogger';
import { config } from '@/config';
import { startMetricsServer } from '@/config/metrics/metrics-server';
import { startGrpcServer } from './transport/grpc/server';
import container from './config/inversify/container';
import TYPES from './config/inversify/types';
import { KafkaManager } from './libs/kafka/kafkaManager';
import { KafkaTopics } from './libs/kafka/kafkaTopics';
import { ConsumerService } from './services/consumer.service';

const startServer = async () => {
    logger.info('Starting Code-Manage Service...');
    try {
        const kafkaManager = container.get<KafkaManager>(TYPES.KafkaManager);
        
        // kafka core setup
        logger.info('Initializing Kafka Manager...');
        await kafkaManager.init();
        logger.info('Kafka Manager initialized successfully.');

        // // create topics
        logger.info('Creating necessary Kafka topics...');
        const topicsToCreate = [
            KafkaTopics.SUBMISSION_JOBS,
            KafkaTopics.SUBMISSION_RESULTS,
            KafkaTopics.RUN_JOBS,
            KafkaTopics.RUN_RESULTS,
            KafkaTopics.CUSTOM_JOBS,
            KafkaTopics.CUSTOM_RESULTS
        ];

        for (const topic of topicsToCreate) {
            await kafkaManager.createTopic(topic);
            logger.debug(`Kafka topic created: ${topic}`);
        }
        logger.info('All necessary Kafka topics created.');

        // // start consumers
        logger.info('Starting Kafka Consumers...');
        const consumerService = container.get<ConsumerService>(TYPES.IConsumerService);
        
        await consumerService.submitCodeExec();
        logger.info(`Consumer started for topic: ${KafkaTopics.SUBMISSION_RESULTS}`);
        
        await consumerService.runCodeExec();
        logger.info(`Consumer started for topic: ${KafkaTopics.RUN_RESULTS}`);
        
        await consumerService.customCodeExec();
        logger.info(`Consumer started for topic: ${KafkaTopics.CUSTOM_RESULTS}`);

        logger.info('All Kafka Consumers are running.');

        // Start prometheus metrics server.
        const metricsPort = config.CODE_MANAGE_SERVICE_METRICS_PORT;
        logger.info(`Starting Prometheus Metrics Server on port ${metricsPort}...`);
        startMetricsServer(metricsPort);
        logger.info('Prometheus Metrics Server started.');

        // start gRPC server.
        logger.info('Starting gRPC Server...');
        startGrpcServer();
        logger.info('gRPC Server started successfully.');
        
        logger.info('Code-Manage Service startup complete. Ready to handle requests.');

    } catch (error) {
        logger.error('Failed to start server : ',error);
        process.exit(1);
    }
}

startServer().catch((err)=>{
    logger.error(`Fatal startup error:`, err);
    process.exit(1);
});