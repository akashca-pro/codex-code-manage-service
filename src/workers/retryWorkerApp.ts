import { kafkaManager } from "@/libs/kafka/kafkaManager";
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';

async function startRetryWorker() {
    await kafkaManager.init();
    await kafkaManager.startRetryWorker();
    logger.info('Kafka retry worker started.');
}

startRetryWorker().catch(err => {
    logger.error('Failed to start Kafka retry worker:', err);
    process.exit(1);
});