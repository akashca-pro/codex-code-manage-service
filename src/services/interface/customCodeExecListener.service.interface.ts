

/**
 * Interface representing the structure of the compile code execution listener service.
 * 
 * @interface
 */
export interface ICustomCodeExecListenerService {

    execute() : Promise<void>

}