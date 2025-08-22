import express from 'express';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { globalErrorHandler } from '@/utils/errorHandler';
import { config } from '@/config';
import { startMetricsServer } from '@/config/metrics/metrics-server';
import { startGrpcServer } from './transport/grpc/server';

const app = express();

// Global error handling.
app.use(globalErrorHandler);

const startServer = () => {
    try {
        // Start prometheus metrics server.
        startMetricsServer(config.METRICS_PORT);

        // start gRPC server.
        startGrpcServer();

    } catch (error) {
        logger.error('Failed to start server : ',error);
        process.exit(1);
    }
}

startServer();