import { ExecutionResult } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { IRunCodeExecListenerService } from "./interface/runCodeExecListener.service.interface";
import { inject, injectable } from "inversify";
import { IMessageProvider } from "@/providers/messageProvider/IMessageProvider.interface";
import TYPES from "@/config/inversify/types";
import { NatsSubjectsPublish, NatsSubjectsSubscribe } from "@/config/nats/natsSubjects";
import { NatsStreams } from "@/config/nats/natsStreams";
import { NatsDurableNames } from "@/config/nats/natsDurableNames";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ICacheProvider } from "@/providers/cacheProvider/ICacheProvider.interface";
import { config } from "@/config";


interface IRunCodeResult {
    problemId : string;
    userId : string;
    stdOut? : string;
    status : string;
    executionTime : number;
    memoryUsage : number;
    executionResult : ExecutionResult;
}

/**
 * Implementation of the run code execution listener service.
 * 
 * @class
 * @implements {IRunCodeExecListenerService}
 */
@injectable()
export class RunCodeExecListenerService implements IRunCodeExecListenerService {

    #_messageProvider : IMessageProvider
    #_cacheProvider : ICacheProvider

    constructor(
        @inject(TYPES.IMessageProvider)
        messageProvider : IMessageProvider,

        @inject(TYPES.ICacheProvider)
        cacheProvider : ICacheProvider
    ){
        this.#_messageProvider = messageProvider,
        this.#_cacheProvider = cacheProvider
    }

    async execute(): Promise<void> {
        
        this.#_messageProvider.subscribeToStream<IRunCodeResult>(
            NatsSubjectsSubscribe.RUN_RESULT,
            NatsStreams.RUN_RESULTS,
            NatsDurableNames.CODE_MANAGER_RUN_NORMAL,
            async (data, msg) => {
                
                const idempotencyKey = `${REDIS_PREFIX.NATS_IDEMPOTENCY_KEY}:${data.userId}`;
                try {
                    // Idempotency check.
                    const alreadyDone = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyDone){
                        msg.ack();
                        return;
                    }

                    this.#_messageProvider.publish(
                        NatsSubjectsPublish.RUN_RESULT(data.userId),
                        data
                    );

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