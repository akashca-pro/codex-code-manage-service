import dotenv from 'dotenv';
dotenv.config();

interface Config {
    REDIS_URL : string;
    SERVICE_NAME : string;
    GRPC_SERVER_URL : string;
    METRICS_PORT : number;
    SUBMISSION_DETAILS_CACHE_EXPIRY : number;
    DEFAULT_GRPC_TIMEOUT : number;
    GRPC_PROBLEM_SERVICE_URL : string;
    KAFKA_IDEMPOTENCY_KEY_EXPIRY : number;
    KAFKA_CLIENT_ID : string;
    KAFKA_BROKERS : string;
    KAFKA_GROUP_ID : string;
    KAFKA_MAX_RETRIES : number;
    KAFKA_RETRY_QUEUE_CAP : number;
    RUN_CODE_DETAILS_CACHE_EXPIRY : number;
    PROBLEM_DETAILS_CACHE_EXPIRY : number;
}

export const config : Config = {
    REDIS_URL : process.env.REDIS_URL || '',
    GRPC_SERVER_URL : process.env.GRPC_SERVER_URL || '',
    METRICS_PORT : Number(process.env.METRICS_PORT) || 9103,
    SERVICE_NAME : process.env.SERVICE_NAME || 'CODE_MANAGE_SERVICE',
    SUBMISSION_DETAILS_CACHE_EXPIRY : Number(process.env.SUBMISSION_DETAILS_CACHE_EXPIRY) || 300,
    DEFAULT_GRPC_TIMEOUT : Number(process.env.DEFAULT_GRPC_TIMEOUT),
    GRPC_PROBLEM_SERVICE_URL : process.env.GRPC_PROBLEM_SERVICE_URL!,
    KAFKA_IDEMPOTENCY_KEY_EXPIRY : Number(process.env.KAFKA_IDEMPOTENCY_KEY_EXPIRY),
    KAFKA_CLIENT_ID : process.env.KAFKA_CLIENT_ID || 'code-manage-service',
    KAFKA_BROKERS : process.env.KAFKA_BROKERS || 'localhost:9092',
    KAFKA_GROUP_ID : process.env.KAFKA_GROUP_ID!,
    RUN_CODE_DETAILS_CACHE_EXPIRY : Number(process.env.RUN_CODE_DETAILS_CACHE_EXPIRY)!,
    PROBLEM_DETAILS_CACHE_EXPIRY : Number(process.env.PROBLEM_DETAILS_CACHE_EXPIRY)!,
    KAFKA_MAX_RETRIES : Number(process.env.KAFKA_MAX_RETRIES)!,
    KAFKA_RETRY_QUEUE_CAP : Number(process.env.KAFKA_RETRY_QUEUE_CAP)!,
}