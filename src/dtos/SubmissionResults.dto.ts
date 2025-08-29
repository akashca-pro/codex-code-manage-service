import { ExecutionResult } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

/**
 * Interface representing the structure of a submission result.
 * 
 * @interface
 */
export interface ISubmissionResult {
    problemId : string;
    submissionId : string;
    userId : string;
    executionResult : ExecutionResult
    executionTime : number ;
    memoryUsage : number;
    status : string;
    score : number;
}
