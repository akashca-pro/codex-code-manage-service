import { ExecutionResult } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { ISubmissionResult } from "../SubmissionResults.dto";
import { IRunCodeResult } from "../RunCodeResults.dto";
import { ICustomCodeResult } from "../CustomCodeRestults.dto";

export class ExecutionResultMapper {

    static toSubmitCodeResultOutDTO (
        data : ISubmissionResult
    ) : ISubmitCodeResultResponse {
        return {
            executionResult : data.executionResult,
            executionTime : data.executionTime,
            memoryUsage : data.memoryUsage,
            status : data.status
        }
    }

    static toRunCodeResultOutDTO (
        data : IRunCodeResult
    ) : IRunCodeCodeResultResponse {
        return {
            executionResult : data.executionResult,
            executionTime : data.executionTime,
            memoryUsage : data.memoryUsage,
            status : data.status,
            stdOut : data.stdOut ? data.stdOut : undefined
        }
    }

    static toCustomCodeResultOutDTO (
        data : ICustomCodeResult
    ) : ICustomCodeResultResponse {
        return {
            executionTime : data.executionTime,
            memoryUsage : data.memoryUsage,
            stdOut : data.stdOut
        }
    }

}

interface ISubmitCodeResultResponse {
    executionResult : ExecutionResult,
    executionTime : number,
    memoryUsage : number,
    status : string
}

interface IRunCodeCodeResultResponse {
    executionResult : ExecutionResult,
    executionTime : number,
    memoryUsage : number,
    status : string,
    stdOut? : string
}

interface ICustomCodeResultResponse {
    stdOut : string,
    executionTime : number,
    memoryUsage : number
}