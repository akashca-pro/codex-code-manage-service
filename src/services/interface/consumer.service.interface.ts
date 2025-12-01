
/**
 * Interface defining the contract for a ConsumerService.
 */
export interface IConsumerService {
    /**
     * Consumes code execution results for submissions,
     * updates problem service, caches the result, 
     * and ensures idempotency.
     */
    submitCodeExec(): Promise<void>;

    /**
     * Consumes normal run code execution results,
     * stores them in cache, and ensures idempotency.
     */
    runCodeExec(): Promise<void>;

    /**
     * Consumes custom code execution results,
     * stores them in cache, and ensures idempotency.
     */
    customCodeExec(): Promise<void>;
}
