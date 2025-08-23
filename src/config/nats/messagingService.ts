import { IMessagingService } from "@/providers/messagingService/messagingService.interface";
import { natsManager } from "@/config/nats";
import { NatsSubject } from "./natsSubjects";

export class NatsMessagingService implements IMessagingService {
    public async connect(): Promise<void> {
        return natsManager.connect();
    }

    public publish<T>(subject: NatsSubject, payload: T): void {
        natsManager.publish(subject, payload);
    }

    public subscribe<T>(subject: NatsSubject, callback: (data: T) => void): void {
        natsManager.subscribe(subject, callback);
    }
}
