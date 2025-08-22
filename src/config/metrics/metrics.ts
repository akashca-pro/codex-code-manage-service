import client from 'prom-client';

client.collectDefaultMetrics();

export const grpcRequestCounter = new client.Counter({
    name : 'grpc_requests_total',
    help : 'Total number of gRPC requests',
    labelNames : ['method','status']
})

export const grpcLatency = new client.Histogram({
  name: 'grpc_request_duration_ms_bucket',
  help: 'Duration of gRPC requests in ms',
  labelNames: ['method', 'status'],
  buckets: [10, 50, 100, 300, 500, 1000, 2000]
});

export const register = client.register