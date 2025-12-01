import TYPES from "@/config/inversify/types";
import { IProducerService } from "@/services/interface/producer.service.interface";
import { withGrpcErrorHandler } from "@/utils/errorHandler";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { 
    CustomCodeExecRequest, 
    CustomCodeExecResponse, 
    RunCodeExecRequest, 
    RunCodeExecResponse, 
    SubmitCodeExecRequest, 
    SubmitCodeExecResponse
 } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/code_manage";
import { inject, injectable } from "inversify";
import logger from '@/utils/pinoLogger'; // Assuming this is the correct logger import

/**
 * Class responsible for handling code manage related grpc requests.
 * * @class
 */
@injectable()
export class CodeManageHandler {

    #_producerService : IProducerService

    constructor(
        @inject(TYPES.IProducerService)
        producerService : IProducerService,
    ){
        this.#_producerService = producerService;
    }

    submitCodeExec = withGrpcErrorHandler<SubmitCodeExecRequest, SubmitCodeExecResponse>(
        async (call, callback) => {
            const method = 'submitCodeExec';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { problemId: req.problemId, userId: req.userId });

            const result = await this.#_producerService.submitCodeExec(req);

            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { userId: req.userId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }
            logger.info(`[gRPC] ${method} completed successfully`, { submissionId: result.data?.submissionId});
            return callback(null, result.data);
        }
    );

    runCodeExec = withGrpcErrorHandler<RunCodeExecRequest, RunCodeExecResponse>(
        async (call, callback) => {
            const method = 'runCodeExec';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { problemId: req.problemId, lang: req.language });

            const result = await this.#_producerService.runCodeExec(req);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: req.problemId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }

            logger.info(`[gRPC] ${method} completed successfully`, { problemId: req.problemId, jobId: result.data?.tempId });
            return callback(null, result.data);
        }
    );

    customCodeExec = withGrpcErrorHandler<CustomCodeExecRequest, CustomCodeExecResponse>(
        async (call, callback) => {
            const method = 'customCodeExec';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { lang: req.language });

            const result = await this.#_producerService.customCodeExec(req);

            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`);
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }

            logger.info(`[gRPC] ${method} completed successfully`, { tempId: result.data?.tempId });
            return callback(null, result.data);
        }
    );


    getServiceHandler() : Record<string, Function> {
        return {
            submitCodeExec : this.submitCodeExec,
            runCodeExec : this.runCodeExec,
            customCodeExec : this.customCodeExec,
        }
    }
}