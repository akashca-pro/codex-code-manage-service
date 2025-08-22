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
            return status.NOT_FOUND

        default:
            return status.UNKNOWN
    }
}