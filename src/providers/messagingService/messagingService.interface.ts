import { NatsSubject } from "@/config/nats/natsSubjects";

/**
 * Interface defines the contract for any messaging service
 * 
 * @interface
 */
export interface IMessagingService {
    connect(): Promise<void>;
    publish<T>(subject: NatsSubject, payload: T): void;
    subscribe<T>(subject: NatsSubject, callback: (data: T) => void): void;
}
