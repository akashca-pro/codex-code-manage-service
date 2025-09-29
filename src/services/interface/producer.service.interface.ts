import { ICustomCodeExecRequestDTO } from "@/dtos/CompileCodeExec.dto";
import { ResponseDTO } from "@/dtos/Response.dto";
import { IRunCodeExecRequestDTO } from "@/dtos/RunCodeExec.dto";
import { SubmitCodeExecRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/code_manage";

/**
 * Interface defining the contract for a ProducerService.
 * 
 * @interface
 */
export interface IProducerService {
    /**
     * Submits code for execution against a specific problem.
     * Creates a submission, publishes a job to Kafka, and returns submission id.
     * 
     * @param data - The code execution request data.
     * @returns A promise that resolves to a ResponseDTO containing submission id.
     */
    submitCodeExec(data: SubmitCodeExecRequest): Promise<ResponseDTO>;

    /**
     * Runs arbitrary code against a problem without creating a persistent submission.
     * Publishes a run job to Kafka.
     * 
     * @param data - The run code execution request data.
     * @returns A promise that resolves to a ResponseDTO indicating success or failure.
     */
    runCodeExec(data: IRunCodeExecRequestDTO): Promise<ResponseDTO>;

    /**
     * Executes custom code unrelated to a problem.
     * Publishes a custom job to Kafka.
     * 
     * @param data - The custom code execution request data.
     * @returns A promise that resolves to a ResponseDTO indicating success or failure.
     */
    customCodeExec(data: ICustomCodeExecRequestDTO): Promise<ResponseDTO>;
}
