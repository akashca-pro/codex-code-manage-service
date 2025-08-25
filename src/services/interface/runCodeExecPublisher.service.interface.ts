import { ResponseDTO } from "@/dtos/Response.dto";
import { IRunCodeExecInputDTO } from "@/dtos/RunCodeExec.dto";

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
     * @param {IRunCodeExecInputDTO} data - The data for run code for sample testcase.
     */
    execute(data : IRunCodeExecInputDTO) : Promise<ResponseDTO>

}