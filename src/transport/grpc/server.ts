import { config } from "@/config";
import container from "@/config/inversify/container";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { CodeManageHandler } from "./codeManage.handler";
import TYPES from "@/config/inversify/types";
import { wrapAll } from "@/utils/metricsMiddleware";
import { CodeManageServiceService } from "@akashcapro/codex-shared-utils/dist/proto/compiled/internal/code_manage";

// Grpc Handler
const codeManageHandlerInstance = container.get<CodeManageHandler>(TYPES.CodeManageHandler)

// Wrap with metrics middleware
const codeManageHandler = wrapAll(codeManageHandlerInstance.getServiceHandler());

export const startGrpcServer = () => {

    const server = new Server();

    server.addService(CodeManageServiceService, codeManageHandler);

    server.bindAsync(
        config.GRPC_SERVER_URL,
        ServerCredentials.createInsecure(),
        (err,port) => {
            if(err){
                logger.error('gRPC Server failed to start : ', err);
            }
            logger.info(`gRPC Server running on port ${port}`);
        }
    )
}