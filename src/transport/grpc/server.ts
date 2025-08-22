import { config } from "@/config";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { Server, ServerCredentials } from "@grpc/grpc-js";


export const startGrpcServer = () => {

    const server = new Server();

    // server.addService(
        
    // )

    // server.addService(
       
    // )

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