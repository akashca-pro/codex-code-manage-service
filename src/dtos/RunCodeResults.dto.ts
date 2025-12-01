import { ExecutionResult } from "./executionResult.dto";

/**
/**
 * Interface representing the structure of a run code result.
 * 
 */
export interface IRunCodeResult {
    tempId : string;
    executionResult : ExecutionResult;
}
