import TYPES from "@/config/inversify/types";
import { IProducerService } from "@/services/interface/producer.service.interface";
import { withGrpcErrorHandler } from "@/utils/errorHandler";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import { 
    CustomCodeExecRequest, 
    CustomCodeExecResponse, 
    RunCodeExecRequest, 
    RunCodeExecResponse, 
    SubmitCodeExecRequest, 
    SubmitCodeExecResponse
 } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/code_manage";
import { inject, injectable } from "inversify";
/**
 * Class responsible for handling code manage related grpc requests.
 * 
 * @class
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
            const req = call.request;

            const result = await this.#_producerService.submitCodeExec(req);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }
            return callback(null, result.data);
        }
    );

    runCodeExec = withGrpcErrorHandler<RunCodeExecRequest, RunCodeExecResponse>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_producerService.runCodeExec(req);
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }

            return callback(null, result.data);
        }
    );

    customCodeExec = withGrpcErrorHandler<CustomCodeExecRequest, CustomCodeExecResponse>(
        async (call, callback) => {
            const req = call.request;

            const result = await this.#_producerService.customCodeExec(req);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }

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