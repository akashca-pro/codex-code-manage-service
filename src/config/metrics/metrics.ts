import client from 'prom-client';

client.collectDefaultMetrics();

export const grpcRequestCounter = new client.Counter({
    name: 'grpc_requests_total',
    help: 'Total number of gRPC requests',
    labelNames: ['method', 'status']
});

export const grpcLatency = new client.Histogram({
  name: 'grpc_request_duration_ms',
  help: 'Duration of gRPC requests in ms',
  labelNames: ['method', 'status'],
  buckets: [10, 50, 100, 300, 500, 1000, 2000]
});

export const producedCounter = new client.Counter({
  name: 'kafka_produced_messages_total',
  help: 'Number of messages produced to kafka',
  labelNames: ['topic', 'status'] 
});
export const consumedCounter = new client.Counter({
  name: 'kafka_consumed_messages_total',
  help: 'Number of consumed messages',
  labelNames: ['topic', 'status'] 
});

export const retryScheduledCounter = new client.Counter({
  name: 'kafka_retries_scheduled_total',
  help: 'Messages scheduled for retry',
  labelNames: ['topic']
});

export const retryQueueGauge = new client.Gauge({
  name: 'kafka_retry_queue_size',
  help: 'Number of items in retry queue (redis)',
  labelNames: ['queue']
});

export const register = client.register;