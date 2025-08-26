import TYPES from "@/config/inversify/types";
import { SystemErrorType } from "@/enums/Error/SystemErrorType.enum";
import { ISubmitCodeExecPublisherService } from "@/services/interface/submitCodeExecPublisher.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { SubmitCodeExecRequest, SubmitCodeExecResponse } from '@akashcapro/codex-shared-utils/dist/proto/compiled/internal/code_manage'
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling submit code exec from grpc gateway.
 * 
 * @class
 */
@injectable()
export class GrpcSubmitCodeExecHandler {

    #_submitCodeExecService : ISubmitCodeExecPublisherService

    constructor(
        @inject(TYPES.ISubmitCodeExecPublisherService)
        submitCodeExecService : ISubmitCodeExecPublisherService
    ){
        this.#_submitCodeExecService = submitCodeExecService
    }

    submitCodeExec = async (
        call : ServerUnaryCall<SubmitCodeExecRequest,SubmitCodeExecResponse>,
        callback : sendUnaryData<SubmitCodeExecResponse>
    ) => {
        try {
            const req = call.request;

            const result = await this.#_submitCodeExecService.execute(req);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }

            return callback(null,result.data);

        } catch (error) {
            logger.error(SystemErrorType.InternalServerError,error);
            return callback({
                code : Status.INTERNAL,
                message : SystemErrorType.InternalServerError
            },null);
        }
    }

    /**
     * Returns the bound handler method for the gRPC service.
     *
     * @remarks
     * This method ensures that the `submitCodeExec` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            submitCodeExec : this.submitCodeExec.bind(this)
        }
    }  
}