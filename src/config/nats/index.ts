import { connect, NatsConnection, JSONCodec, Subscription, Status } from 'nats';
import { config } from '..';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { NatsSubject } from './natsSubjects';

class NatsManager {
    private static _instance: NatsManager;
    private natsConnection?: NatsConnection;
    private jsonCodec = JSONCodec();

    private constructor() {}

    public static getInstance(): NatsManager {
        if (!NatsManager._instance) {
            NatsManager._instance = new NatsManager();
        }
        return NatsManager._instance;
    }

    public async connect(): Promise<void> {
        if (this.natsConnection) return;
        
        try {
            const natsUrl = config.NATS_URL
            this.natsConnection = await connect({
                servers: natsUrl,
                reconnect: true,
                maxReconnectAttempts: -1,
                reconnectTimeWait: 5000,
            });
            logger.info(`Connected to NATS at ${this.natsConnection.getServer()}`);
            this.handleStatusUpdates();
        } catch (err) {
            logger.error('Failed to connect to NATS:', err);
            process.exit(1);
        }
    }

    public publish<T>(subject : NatsSubject, jobPayload: T): void {
        if (!this.natsConnection) {
            logger.error('NATS connection not available to publish job.');
            return;
        }
        this.natsConnection.publish(subject, this.jsonCodec.encode(jobPayload));
        logger.info(`Published message to subject: ${subject}`);
    }

    public subscribe<T>(subject: NatsSubject, callback: (data: T) => void): void {
        if (!this.natsConnection) {
            logger.error('NATS connection not available to subscribe.');
            return;
        }
        const subscription: Subscription = this.natsConnection.subscribe(subject);
        console.log(`Listening on NATS subject: ${subject}`);

        (async () => {
            for await (const msg of subscription) {
                const decoded = this.jsonCodec.decode(msg.data) as T;
                callback(decoded);
            }
        })();
    }

    private async handleStatusUpdates(): Promise<void> {
        if (!this.natsConnection) return;
        for await (const status of this.natsConnection.status()) {
            console.info(`NATS status update: ${(status as Status).type}`);
        }
    }
}

export const natsManager = NatsManager.getInstance();