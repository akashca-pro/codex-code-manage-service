import { inject, injectable } from "inversify";
import { ISubmitCodeExecListenerService } from "./interface/submitCodeExecListener.service.interface";
import { IMessageProvider } from "@/providers/messageProvider/IMessageProvider.interface";
import TYPES from "@/config/inversify/types";
import { NatsSubjectsPublish, NatsSubjectsSubscribe } from "@/config/nats/natsSubjects";
import { NatsStreams } from "@/config/nats/natsStreams";
import { NatsDurableNames } from "@/config/nats/natsDurableNames";
import { ExecutionResult } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { ICacheProvider } from "@/providers/cacheProvider/ICacheProvider.interface";
import { IGrpcProblemService } from "@/infra/grpc/ProblemService.interface";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { config } from "@/config";

interface ISubmissionResult {
    problemId : string;
    submissionId : string;
    userId : string;
    executionResult : ExecutionResult
    executionTime : number ;
    memoryUsage : number;
    status : string;
    score : number;
}

/**
 * Implementation of the submit code execution listener service.
 * 
 * @class
 * @implements {ISubmitCodeExecListenerService}
 */
@injectable()
export class SubmitCodeExecListener implements ISubmitCodeExecListenerService {

    #_messageProvider : IMessageProvider
    #_cacheProvider : ICacheProvider
    #_problemGrpcClient : IGrpcProblemService

    constructor(
        @inject(TYPES.IMessageProvider)
        messageProvider : IMessageProvider,

        @inject(TYPES.ICacheProvider)
        cacheProvider : ICacheProvider,

        @inject(TYPES.IGrpcProblemService)
        problemGrpcClient : IGrpcProblemService
    ){
        this.#_messageProvider = messageProvider,
        this.#_cacheProvider = cacheProvider,
        this.#_problemGrpcClient = problemGrpcClient
    }

    async execute(): Promise<void> {
        
        this.#_messageProvider.subscribeToStream<ISubmissionResult>(
            NatsSubjectsSubscribe.SUBMISSION_RESULT,
            NatsStreams.SUBMISSION_RESULTS,
            NatsDurableNames.CODE_MANAGER_SUB_NORMAL,
            async (data, msg) => {

                const idempotencyKey = `${REDIS_PREFIX.NATS_IDEMPOTENCY_KEY}:${data.submissionId}`;
                try {
                    // Idempotency check.
                    const alreadyDone = await this.#_cacheProvider.get(idempotencyKey);
                    if(alreadyDone){
                        msg.ack();
                        return;
                    }

                    // Cache submission result.
                    const cacheKey = `${REDIS_PREFIX.SUBMISSION_NORMAL_CACHE}:${data.userId}:${data.submissionId}`
                    await this.#_cacheProvider.set(
                        cacheKey,
                        data,
                        config.SUBMISSION_DETAILS_CACHE_EXPIRY
                    );

                    // Update via gRPC
                    await this.#_problemGrpcClient.updateSubmission({
                        ...data,
                        Id : data.problemId,
                    });

                    // Publish to ws gateway.
                    this.#_messageProvider.publish(
                        NatsSubjectsPublish.SUBMISSION_RESULT(data.submissionId),
                        data
                    );

                } catch (error) {
                    msg.nak();
                }
            }
        )
    }
}
