
/**
 * Interface representing the structure of the submit code execution listener service.
 * 
 * @interface
 */
export interface ISubmitCodeExecListenerService {

    /**
     * Listen for the submission result from the code execution service.
     * 
     * @async
     */
    execute() : Promise<void>

}