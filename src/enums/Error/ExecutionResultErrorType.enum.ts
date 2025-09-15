
/**
 * Enum representing the error types related to exec results send back to client.
 * 
 * @enum
 */
export enum ExecutionResultErrorType {

    SubmitCodeResultNotFound = 'Submit code result not found',

    RunCodeResultNotFound = 'Run code result not found',

    CustomCodeResultNotFound = 'Custom code result not found',

    UnauthorizedAccess = 'Unauthorized access to execution details.'
}