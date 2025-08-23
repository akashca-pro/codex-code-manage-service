import { CreateSubmissionRequest, GetProblemRequest, Problem, ProblemServiceClient, Submission, SubmissionServiceClient, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { GrpcBaseService } from "./GrpcBaseService";
import { credentials } from "@grpc/grpc-js";
import { config } from "@/config";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import { IGrpcProblemService } from "./ProblemService.interface";

/**
 * Class implementing the Grpc problem handler.
 * 
 * @class
 * @extends {IGrpcProblemService}
 * @implements {IGrpcProblemService}
 */
export class GrpcProblemService extends GrpcBaseService implements IGrpcProblemService {

    #_problemClient : ProblemServiceClient
    #_submissionClient : SubmissionServiceClient
    
    constructor(){
        super();

        this.#_problemClient = new ProblemServiceClient(
            config.GRPC_PROBLEM_SERVICE_URL!,
            credentials.createInsecure()
        );

        this.#_submissionClient = new SubmissionServiceClient(
            config.GRPC_PROBLEM_SERVICE_URL!,
            credentials.createInsecure()
        )
    }

    getProblem = async (
        request: GetProblemRequest
    ) : Promise<Problem> => {
        return this.grpcCall(
            this.#_problemClient.getProblem.bind(this.#_problemClient),
            request
        );
    }

    createSubmission = async(
        request : CreateSubmissionRequest
    ) : Promise<Submission> => {
        return this.grpcCall(
            this.#_submissionClient.createSubmission.bind(this.#_submissionClient),
            request
        )
    }

    updateSubmission = async(
        request : UpdateSubmissionRequest
    ) : Promise<Empty> => {
        return this.grpcCall(
            this.#_submissionClient.updateSubmission.bind(this.#_submissionClient),
            request
        )
    }
}