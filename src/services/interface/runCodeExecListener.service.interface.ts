
/**
 * Interface representing the structure of the run code execution listener service.
 * 
 * @interface
 */
export interface IRunCodeExecListenerService {

    /**
     * Listen for the result for run code job from code execution service.
     * 
     * @async
     */
    execute() : Promise<void>

}