import { ResponseDTO } from "@/dtos/Response.dto";

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
     * @param {problemId} problemId - The id of the specific problem.
     * @param {submissionId} submissionId - The id of the submission of the specific problem. 
     * @returns {ResponseDTO} - The response contains result of the submission.
     */
    submitCodeResult (
        userId : string, 
        problemId : string,
        submissionId : string
    ) : Promise<ResponseDTO>

    /**
     * This method get the run result from the cache and send to gateway.
     * 
     * @param tempId - The unique id of the user.
     * @param problemId - The id of the specific problem.
     * @returns {ResponseDTO} - The response contains result of the run code.
     */
    runCodeResult(
        tempId : string,
        problemId : string,
    ) : Promise<ResponseDTO>

    /**
     * This method get the run result from the cach and send to gateway.
     * 
     * @param tempId - The unique id of the user.
     * @returns {ResponseDTO} - The response contains result of the run code.
     */
    customCodeResult(tempId : string) : Promise<ResponseDTO>

}