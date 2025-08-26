import { ICustomCodeExecRequestDTO } from "@/dtos/CompileCodeExec.dto";
import { ResponseDTO } from "@/dtos/Response.dto";

/**
 * Interface representing the structure of the compile code execution publisher service.
 * 
 * @interface
 */
export interface ICustomCodeExecPublisherService {

    execute(data : ICustomCodeExecRequestDTO) : Promise<ResponseDTO>

}