import { ResponseDTO } from "@/dtos/Response.dto";
import { SubmitCodeExecRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/internal/code_manage";

/**
 * Interface representing the structure of the submit code execution publisher service.
 * 
 * @interface
 */
export interface ISubmitCodeExecPublisherService {
    
    /**
     * Executes the submit code execution service.
     * 
     * @async
     * @param {SubmitCodeExecRequest} data - The data from user
     */
    execute(data : SubmitCodeExecRequest) : Promise<ResponseDTO>

}