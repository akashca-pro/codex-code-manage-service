import { inject, injectable } from "inversify";
import { ICustomCodeExecListenerService } from "./interface/customCodeExecListener.service.interface";
import { IMessageProvider } from "@/providers/messageProvider/IMessageProvider.interface";
import { ICacheProvider } from "@/providers/cacheProvider/ICacheProvider.interface";
import TYPES from "@/config/inversify/types";
import { NatsSubjectsPublish, NatsSubjectsSubscribe } from "@/config/nats/natsSubjects";
import { NatsStreams } from "@/config/nats/natsStreams";
import { NatsDurableNames } from "@/config/nats/natsDurableNames";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ExecutionResult } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { config } from "@/config";

interface ICustomCodeResult {
    tempId : string;
    stdOut : string;
    status : string;
    executionTime : number;
    memoryUsage : number;
    executionResult : ExecutionResult;
}

/**
 * Implementation of the custom code execution listener service.
 * 
 * @class
 * @implements {ICustomCodeExecListenerService}
 */
@injectable()
export class CustomCodeExecListenerService implements ICustomCodeExecListenerService {

    #_cacheProvider : ICacheProvider
    #_messageProvider : IMessageProvider

    constructor(
        @inject(TYPES.ICacheProvider)
        cacheProvider : ICacheProvider,

        @inject(TYPES.IMessageProvider)
        messageProvider : IMessageProvider
    ){
        this.#_cacheProvider = cacheProvider,
        this.#_messageProvider = messageProvider
    }

    async execute(): Promise<void> {
        
        this.#_messageProvider.subscribeToStream(
            NatsSubjectsSubscribe.CUSTOM_RESULT,
            NatsStreams.CUSTOM_RESULTS,
            NatsDurableNames.CODE_MANAGER_CUSTOM_CODE,
            async (data : ICustomCodeResult, msg) => {

                const idempotencyKey = `${REDIS_PREFIX.NATS_IDEMPOTENCY_KEY}:${data.tempId}`;
                try {
                    // Idempotency check.
                    const alreadyDone = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyDone){
                        msg.ack();
                        return;
                    }

                    this.#_messageProvider.publish(
                        NatsSubjectsPublish.CUSTOM_RESULT(data.tempId),
                        data
                    )

                    await this.#_cacheProvider.set(
                        idempotencyKey,
                        '1',
                        config.NATS_IDEMPOTENCY_KEY_EXPIRY
                    );

                    msg.ack();
                } catch (error) {
                    msg.nak();
                }
            }
        )
    }
}

