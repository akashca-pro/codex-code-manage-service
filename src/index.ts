import express from 'express';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { globalErrorHandler } from '@/utils/errorHandler';
import { config } from '@/config';
import { startMetricsServer } from '@/config/metrics/metrics-server';
import { startGrpcServer } from './transport/grpc/server';
import container from './config/inversify/container';
import { IMessageProvider } from './providers/messageProvider/IMessageProvider.interface';
import TYPES from './config/inversify/types';

const app = express();

// Global error handling.
app.use(globalErrorHandler);

const startServer = async () => {
    try {
        // Start NATS client to server
        const messageProvider = container.get<IMessageProvider>(TYPES.IMessageProvider);
        await messageProvider.connect()

        // Start prometheus metrics server.
        startMetricsServer(config.METRICS_PORT);

        // start gRPC server.
        startGrpcServer();

    } catch (error) {
        logger.error('Failed to start server : ',error);
        process.exit(1);
    }
}

startServer().catch((err)=>{
    logger.error(`Fatal startup error:`, err);
    process.exit(1);
});