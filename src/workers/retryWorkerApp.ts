import container from "@/config/inversify/container";
import TYPES from "@/config/inversify/types";
import { KafkaManager } from "@/libs/kafka/kafkaManager";
import { KafkaTopics } from "@/libs/kafka/kafkaTopics";
import logger from '@/utils/pinoLogger';

const kafkaManager = container.get<KafkaManager>(TYPES.KafkaManager);

async function startRetryWorker() {
    logger.info('Starting Kafka retry worker process...');
    
    // Initialize Kafka Manager
    logger.info('Initializing Kafka Manager...');
    await kafkaManager.init();
    logger.info('Kafka Manager initialized successfully.');
    
    // Create Retry Topic
    logger.info(`Creating Kafka topic: ${KafkaTopics.RETRY_QUEUE}`);
    await kafkaManager.createTopic(KafkaTopics.RETRY_QUEUE);
    logger.info(`Kafka topic created: ${KafkaTopics.RETRY_QUEUE}`);

    // Create DLQ Topic
    logger.info(`Creating Kafka topic: ${KafkaTopics.DLQ_QUEUE}`);
    await kafkaManager.createTopic(KafkaTopics.DLQ_QUEUE);
    logger.info(`Kafka topic created: ${KafkaTopics.DLQ_QUEUE}`);
    
    // Start the Retry Worker logic
    logger.info('Starting consumer logic for retry worker...');
    await kafkaManager.startRetryWorker();
    
    logger.info('Kafka retry worker started and listening.');
}

startRetryWorker().catch(err => {
    logger.error('Failed to start Kafka retry worker:', err);
    process.exit(1);
});