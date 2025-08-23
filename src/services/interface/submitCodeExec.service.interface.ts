import { ICreateSubmissionRequestDTO } from "@/dtos/CreateSubmission.dto";
import { ResponseDTO } from "@/dtos/Response.dto";

/**
 * Interface representing the structure of the submit execution service.
 * 
 * @interface
 */
export interface ISubmitCodeExecService {
    
    /**
     * Executes the submit code execution service.
     * 
     * @async
     * @param {ICreateSubmissionRequestDTO} data - The data from user
     */
    execute(data : ICreateSubmissionRequestDTO) : Promise<ResponseDTO>

}