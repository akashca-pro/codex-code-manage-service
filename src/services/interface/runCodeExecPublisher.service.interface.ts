import { ResponseDTO } from "@/dtos/Response.dto";
import { IRunCodeExecRequestDTO } from "@/dtos/RunCodeExec.dto";

/**
 * Interface representing the structure of the run code execution publisher service.
 * 
 * @interface
 */
export interface IRunCodeExecPublisherService {

    /**
     * Executes the run code execution service.
     * 
     * @async
     * @param {IRunCodeExecRequestDTO} data - The data for run code for sample testcase.
     */
    execute(data : IRunCodeExecRequestDTO) : Promise<ResponseDTO>

}