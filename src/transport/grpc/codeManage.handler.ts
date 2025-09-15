import TYPES from "@/config/inversify/types";
import { IProducerService } from "@/services/interface/producer.service.interface";
import { withGrpcErrorHandler } from "@/utils/errorHandler";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import { CustomCodeExecRequest, CustomCodeResultRequest, CustomCodeResultResponse, RunCodeExecRequest, RunCodeResultRequest, RunCodeResultResponse, SubmitCodeExecRequest, SubmitCodeExecResponse, SubmitCodeResultRequest, SubmitCodeResultResponse } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/code_manage";
import { inject, injectable } from "inversify";
import { IExecutionResultService } from "@/services/interface/executionResult.service.interface";

/**
 * Class responsible for handling code manage related grpc requests.
 * 
 * @class
 */
@injectable()
export class CodeManageHandler {

    #_producerService : IProducerService
    #_executionResultService : IExecutionResultService

    constructor(
        @inject(TYPES.IProducerService)
        producerService : IProducerService,

        @inject(TYPES.IExecutionResultService)
        executionResultService : IExecutionResultService
    ){
        this.#_producerService = producerService;
        this.#_executionResultService = executionResultService
    }

    submitCodeExec = withGrpcErrorHandler<SubmitCodeExecRequest, SubmitCodeExecResponse>(
        async (call, callback) => {
            const req = call.request;

            const result = await this.#_producerService.submitCodeExec(req);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }

            return callback(null,result.data);
        }
    );

    runCodeExec = withGrpcErrorHandler<RunCodeExecRequest, Empty>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_producerService.runCodeExec(req);
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }

            return callback(null,{});
        }
    );

    customCodeExec = withGrpcErrorHandler<CustomCodeExecRequest, Empty>(
        async (call, callback) => {
            const req = call.request;

            const result = await this.#_producerService.customCodeExec(req);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }

            return callback(null,{});
        }
    );

    submitCodeResult = withGrpcErrorHandler<SubmitCodeResultRequest, SubmitCodeResultResponse>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_executionResultService.submitCodeResult(
                req.userId,
                req.submissionId
            );
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }
            return callback(null,result.data);
        }
    );

    runCodeResult = withGrpcErrorHandler<RunCodeResultRequest, RunCodeResultResponse>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_executionResultService.runCodeResult(
                req.userId
            );
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }
            return callback(null,result.data);
        }
    );

    customCodeResult = withGrpcErrorHandler<CustomCodeResultRequest, CustomCodeResultResponse>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_executionResultService.customCodeResult(
                req.tempId
            );
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }
            return callback(null,result.data);
        }
    );

    getServiceHandler() : Record<string, Function> {
        return {
            submitCodeExec : this.submitCodeExec,
            runCodeExec : this.runCodeExec,
            customCodeExec : this.customCodeExec,
            submitCodeResult : this.submitCodeResult,
            runCodeResult :  this.runCodeResult,
            customCodeResult : this.customCodeExec,
        }
    }
}