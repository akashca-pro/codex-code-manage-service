import { ExecutionResult } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

/**
/**
 * Interface representing the structure of a run code result.
 * 
 */
export interface IRunCodeResult {
    problemId : string;
    userId : string;
    stdOut? : string;
    status : string;
    executionTime : number;
    memoryUsage : number;
    executionResult : ExecutionResult;
}
