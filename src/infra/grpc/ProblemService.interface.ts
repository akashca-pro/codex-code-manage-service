import { CreateSubmissionRequest, GetProblemRequest, Problem, Submission, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";


/**
 * Interface representing the structure of the problem service grpc client.
 * 
 * @interface
 */
export interface IGrpcProblemService {

    getProblem : (request : GetProblemRequest) => Promise<Problem>  

    createSubmission : (request : CreateSubmissionRequest) => Promise<Submission>

    updateSubmission : (request : UpdateSubmissionRequest) => Promise<Empty>

}