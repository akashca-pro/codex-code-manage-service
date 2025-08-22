import { CreateSubmissionRequest, Submission, SubmissionServiceClient, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { GrpcBaseService } from "./GrpcBaseService";
import { config } from "@/config";
import { credentials } from "@grpc/grpc-js";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";

/**
 * Class implementing the Grpc problem handler.
 * 
 * @class
 * @implements {GrpcBaseService}
 */
class GrpcSubmissionService extends GrpcBaseService {

    #_client : SubmissionServiceClient

    constructor(){
        super();
        this.#_client = new SubmissionServiceClient(
            config.GRPC_PROBLEM_SERVICE_URL!,
            credentials.createInsecure()
        );
    }

    createSubmission = async(
        request : CreateSubmissionRequest
    ) : Promise<Submission> => {
        return this.grpcCall(
            this.#_client.createSubmission.bind(this.#_client),
            request
        )
    }

    updateSubmission = async(
        request : UpdateSubmissionRequest
    ) : Promise<Empty> => {
        return this.grpcCall(
            this.#_client.updateSubmission.bind(this.#_client),
            request
        )
    }
}

export default new GrpcSubmissionService();