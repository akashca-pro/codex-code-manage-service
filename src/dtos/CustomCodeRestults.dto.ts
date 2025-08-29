import { ExecutionResult } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

/**
 * Interface representing the structure of a custom code exec result.
 * 
 * @interface
 */
export interface ICustomCodeResult {
    tempId : string;
    stdOut : string;
    status : string;
    executionTime : number;
    memoryUsage : number;
    executionResult : ExecutionResult;
}

