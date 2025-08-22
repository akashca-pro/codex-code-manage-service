import { GetProblemRequest, Problem, ProblemServiceClient } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { GrpcBaseService } from "./GrpcBaseService";
import { credentials } from "@grpc/grpc-js";
import { config } from "@/config";

/**
 * Class implementing the Grpc problem handler.
 * 
 * @class
 * @implements {IGrpcProblemService}
 */
class GrpcProblemService extends GrpcBaseService {

    #_client : ProblemServiceClient
    
    constructor(){
        super();
        this.#_client = new ProblemServiceClient(
            config.GRPC_PROBLEM_SERVICE_URL!,
            credentials.createInsecure()
        );
    }

    getProblem = async (
        request: GetProblemRequest
    ) : Promise<Problem> => {
        return this.grpcCall(
            this.#_client.getProblem.bind(this.#_client),
            request
        );
    }
}

export default new GrpcProblemService();