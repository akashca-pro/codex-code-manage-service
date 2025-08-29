import { Kafka, Producer, Consumer, Admin, logLevel, Message } from 'kafkajs';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { config } from '@/config';
import Redis from 'ioredis';
import client from 'prom-client';
import { REDIS_PREFIX } from '@/config/redis/keyPrefix';
import { KafkaTopics } from './kafkaTopics';

const redis = new Redis(config.REDIS_URL);

// Prometheus Metrics
const kafkaMessagesSent = new client.Counter({
  name: 'kafka_messages_sent_total',
  help: 'Total messages sent to Kafka'
});
const kafkaMessagesConsumed = new client.Counter({
  name: 'kafka_messages_consumed_total',
  help: 'Total messages consumed from Kafka'
});
const kafkaConsumerLag = new client.Gauge({
  name: 'kafka_consumer_lag',
  help: 'Kafka Consumer lag'
});

export class KafkaManager {
  private static _instance: KafkaManager;
  private kafka: Kafka;
  private producer?: Producer;
  private admin?: Admin;
  private consumers = new Map<string, Consumer>();
  private retryQueueKey = KafkaTopics.RETRY_QUEUE;
  private dlqTopic = KafkaTopics.DLQ_QUEUE;
  private maxRetries = 3;
  private retryWorkerActive = false;

  private constructor() {
    this.kafka = new Kafka({
      clientId: config.KAFKA_CLIENT_ID,
      brokers: config.KAFKA_BROKERS.split(','),
      logLevel: logLevel.INFO,
    });

    // Graceful shutdown
    process.on('SIGINT', () => this.disconnect());
    process.on('SIGTERM', () => this.disconnect());
  }

  public static getInstance(): KafkaManager {
    if (!KafkaManager._instance) {
      KafkaManager._instance = new KafkaManager();
    }
    return KafkaManager._instance;
  }

  public async init(): Promise<void> {
    if (!this.producer) {
      this.producer = this.kafka.producer({ idempotent: true });
      await this.producer.connect();
    }
    if (!this.admin) {
      this.admin = this.kafka.admin();
      await this.admin.connect();
    }

    logger.info('KafkaManager initialized');
  }

  // Create topic if not exists
  public async createTopic(topic: string, numPartitions = 1, replicationFactor = 1) {
    if (!this.admin) throw new Error('Kafka admin not initialized');
    const topics = await this.admin.listTopics();
    if (!topics.includes(topic)) {
      await this.admin.createTopics({ topics: [{ topic, numPartitions, replicationFactor }] });
      logger.info(`Created topic: ${topic}`);
    }
  }

  // Send message with retry metadata
  public async sendMessage(topic: string, key: string | null, value: any, headers?: Record<string, string>) {
    if (!this.producer) throw new Error('Kafka producer not initialized');
    await this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value), headers: headers || {} }]
    });
    kafkaMessagesSent.inc();
  }

  // Batch message sending
  public async sendBatch(topic: string, messages: { key: string | null, value: any }[]) {
    if (!this.producer) throw new Error('Kafka producer not initialized');
    const kafkaMessages: Message[] = messages.map(m => ({
      key: m.key,
      value: JSON.stringify(m.value)
    }));
    await this.producer.send({ topic, messages: kafkaMessages });
    kafkaMessagesSent.inc(messages.length);
  }

  // Consumer with retry + DLQ
  public async createConsumer(
    groupId: string, 
    topic: string, 
    eachMessage: (payload: any) => Promise<void>, 
    dlqTopic: string = this.dlqTopic) {
    if (this.consumers.has(groupId)) return this.consumers.get(groupId)!;
    const consumer = this.kafka.consumer({ 
        groupId,
    });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const payload = message.value ? JSON.parse(message.value.toString()) : null;
          await eachMessage(payload);
          kafkaMessagesConsumed.inc();
        } catch (error) {
          logger.error('Message processing failed, scheduling retry', error);
          await this.scheduleRetry(topic, message, dlqTopic);
        }
      }
    });

    this.consumers.set(groupId, consumer);
    logger.info(`Consumer created for groupId=${groupId}, topic=${topic}`);
    return consumer;
  }

  // Schedule retry in Redis
  private async scheduleRetry(topic: string, message: Message, dlqTopic?: string) {
    const headers = message.headers || {};
    const retryCount = headers['x-retry-count'] ? parseInt(headers['x-retry-count'].toString()) : 0;

    if (retryCount >= this.maxRetries) {
      if (dlqTopic) {
        await this.sendMessage(dlqTopic, message.key?.toString() || null, message.value?.toString());
        logger.warn(`Message moved to DLQ after ${this.maxRetries} retries`);
      }
      return;
    }

    const nextRetry = Math.floor(Date.now() / 1000) + this.getRetryDelay(retryCount);
    const retryData = {
      topic,
      key: message.key?.toString() || null,
      value: message.value?.toString() || '',
      headers: { ...headers, 'x-retry-count': String(retryCount + 1) }
    };

    await redis.zadd(this.retryQueueKey, nextRetry, JSON.stringify(retryData));
  }

  // Retry worker
  public async startRetryWorker() {
    if (this.retryWorkerActive) return;
    this.retryWorkerActive = true;

    setInterval(async () => {
      const now = Math.floor(Date.now() / 1000);
      const messages = await redis.zrangebyscore(this.retryQueueKey, 0, now);

      for (const msg of messages) {
        const data = JSON.parse(msg);
        await this.sendMessage(data.topic, data.key, data.value, data.headers);
        await redis.zrem(this.retryQueueKey, msg);
      }
    }, 5000);
  }

  // Dynamic Config Reload
  public async reloadConfig(newBrokers: string[]) {
    logger.info('Reloading Kafka brokers...');
    await this.disconnect();
    this.kafka = new Kafka({ clientId: config.KAFKA_CLIENT_ID, brokers: newBrokers, logLevel: logLevel.INFO });
    await this.init();
  }

  // Graceful Shutdown
  public async disconnect(): Promise<void> {
    await Promise.all([...this.consumers.values()].map((c) => c.disconnect()));
    if (this.producer) await this.producer.disconnect();
    if (this.admin) await this.admin.disconnect();
    logger.info('KafkaManager disconnected');
  }

    private getRetryDelay(retryCount: number) {
    const baseDelay = Math.min(60 * 10, Math.pow(2, retryCount) * 5); // max 10min
    const jitter = Math.floor(Math.random() * 1000); // 0–1s
    return baseDelay + jitter;
    }
}

export const kafkaManager = KafkaManager.getInstance();
