import container from "@/config/inversify/container";
import TYPES from "@/config/inversify/types";
import { KafkaManager } from "@/libs/kafka/kafkaManager";
import { KafkaTopics } from "@/libs/kafka/kafkaTopics";
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';

const kafkaManager = container.get<KafkaManager>(TYPES.KafkaManager);

async function startRetryWorker() {
    await kafkaManager.init();
    await kafkaManager.createTopic(KafkaTopics.RETRY_QUEUE);
    await kafkaManager.createTopic(KafkaTopics.DLQ_QUEUE);
    await kafkaManager.startRetryWorker();
    logger.info('Kafka retry worker started.');
}

startRetryWorker().catch(err => {
    logger.error('Failed to start Kafka retry worker:', err);
    process.exit(1);
});