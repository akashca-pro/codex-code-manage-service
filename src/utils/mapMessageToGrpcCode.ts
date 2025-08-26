import { ProblemErrorType } from "@/enums/Error/ProblemServiceErrorType.enum";
import { SubmissionErrorType } from "@/enums/Error/submissionErrorType.enum";
import { status } from "@grpc/grpc-js";

/**
 * Maps a known domain message to a gRPC status code.
 * 
 * @param {string} message - The domain message from enum.
 * @returns {status} gRPC status code
 */
export const mapMessageToGrpcStatus = (message : string) : status => {
    switch(true){

        case message === SubmissionErrorType.SubmissionNotFound:
        case message === ProblemErrorType.ProblemNotFound:
            return status.NOT_FOUND
        
        case message.startsWith('Syntax Error:'):
            return status.INVALID_ARGUMENT

        default:
            return status.UNKNOWN
    }
}