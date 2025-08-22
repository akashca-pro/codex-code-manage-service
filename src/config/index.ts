import dotenv from 'dotenv';
dotenv.config();

interface Config {
    REDIS_URL : string;
    SERVICE_NAME : string;
    GRPC_SERVER_URL : string;
    METRICS_PORT : number;
    SUBMISSION_DETAILS_CACHE_EXPIRY : number;
}

export const config : Config = {
    REDIS_URL : process.env.REDIS_URL || '',
    GRPC_SERVER_URL : process.env.GRPC_SERVER_URL || '',
    METRICS_PORT : Number(process.env.METRICS_PORT) || 9102,
    SERVICE_NAME : process.env.SERVICE_NAME || 'PROBLEM_SERVICE',
    SUBMISSION_DETAILS_CACHE_EXPIRY : Number(process.env.SUBMISSION_DETAILS_CACHE_EXPIRY) || 300
}