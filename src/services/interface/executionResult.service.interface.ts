import { ICustomCodeResult } from "@/dtos/CustomCodeRestults.dto";
import { ResponseDTO } from "@/dtos/Response.dto";
import { IRunCodeResult } from "@/dtos/RunCodeResults.dto";
import { ISubmissionResult } from "@/dtos/SubmissionResults.dto";

/**
 * Interface defining the contract for a Execution result service.
 * 
 * @interface
 */
export interface IExecutionResultService {

    /**
     * This methods get the submission result from the cache and send to gateway.
     * 
     * @async
     * @param {userId} userId - The unique id of the user.
     * @param {submissionId} submissionId - The id of the submission. 
     * @returns {ResponseDTO} - The response contains result of the submission.
     */
    submitCodeResult (
        userId : string, 
        submissionId : string
    ) : Promise<ResponseDTO>

    /**
     * This method get the run result from the cache and send to gateway.
     * 
     * @param userId - The unique id of the user.
     * @returns {ResponseDTO} - The response contains result of the run.
     */
    runCodeResult(userId : string) : Promise<ResponseDTO>

    /**
     * This method get the run result from the cach and send to gateway.
     * 
     * @param tempId - The unique id of the user.
     * @returns {ResponseDTO} - The response contains result of the run.
     */
    customCodeResult(tempId : string) : Promise<ResponseDTO>

}