import { ExecutionResult } from "./executionResult.dto";

/**
 * Interface representing the structure of a submission result.
 * 
 * @interface
 */
export interface ISubmissionResult {
    submissionId : string;
    userId : string;
    executionResult : ExecutionResult
}
