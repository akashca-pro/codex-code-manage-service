import { 
    connect, NatsConnection, JSONCodec, Subscription, Status, JetStreamClient, 
    JetStreamManager, StorageType, 
    AckPolicy} from 'nats';
import { config } from '..';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { NatsSubject } from './natsSubjects';

class NatsManager {
    private static _instance: NatsManager;
    private natsConnection?: NatsConnection;
    private jsonCodec = JSONCodec();

    // jetStream contexts
    private js? : JetStreamClient;
    private jsm? : JetStreamManager;

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

            // init jetstream.
            this.js = this.natsConnection.jetstream();
            this.jsm = await this.natsConnection.jetstreamManager();

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

    public async ensureStream(streamName : string, subjects : string[]) : Promise<void>{
        if(!this.jsm){
            logger.error('JetStream Manager not initialized.');
            return;
        }

        const streams = await this.jsm.streams.list().next();
        if(!streams.find(s=> s.config.name === streamName)){
            await this.jsm.streams.add({ name : streamName, subjects, storage : StorageType.File });
            logger.info(`Created JetStream stream: ${streamName}`);
        }
    }

    public async publishToStream<T>(subject : NatsSubject, payload : T) : Promise<void> {
        if (!this.js) {
            logger.error('JetStream client not initialized.');
            return;
        }
        await this.js.publish(subject, this.jsonCodec.encode(payload));
        logger.info(`Published JetStream message to ${subject}`);
    } 

    public async subscribeToStream<T>(
        subject : NatsSubject,
        streamName : string, 
        durableName : string, 
        callback : (data : T) => void 
    ) : Promise<void> {
        if (!this.jsm || !this.js) {
            logger.error('JetStream client not initialized.');
            return;
        }

        const jc = JSONCodec();

        await this.jsm.consumers.add(
            await this.jsm.streams.find(subject),
            {
            durable_name: durableName,
            filter_subject: subject,
            ack_policy: AckPolicy.Explicit
            }
        );

        this.ensureStream(streamName, [subject]);

        this.jsm.consumers.add(streamName,{
            durable_name : durableName,
            filter_subject : subject,
            ack_policy : AckPolicy.Explicit,
            ack_wait : 30_000_000_000,
            max_deliver : -1
        })



        const consumer = await this.js.consumers.get(streamName, durableName);
        const messages = await consumer.consume({ max_messages: 0 });

        logger.info(`Consuming ${subject} from stream=${streamName}, durable=${durableName}`);

        (async () => {
            for await (const m of messages) {
            try {
                const decoded = jc.decode(m.data) as T;
                callback(decoded);
                m.ack();
            } catch (err) {
                logger.error(`Error processing JetStream message on ${subject}`, err);
            }
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