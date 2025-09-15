import { inject, injectable } from "inversify";
import { IExecutionResultService } from "./interface/executionResult.service.interface";
import TYPES from "@/config/inversify/types";
import { ICacheProvider } from "@/providers/ICacheProvider.interface";
import { ResponseDTO } from "@/dtos/Response.dto";
import { ISubmissionResult } from "@/dtos/SubmissionResults.dto";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ExecutionResultErrorType } from "@/enums/Error/ExecutionResultErrorType.enum";
import { IRunCodeResult } from "@/dtos/RunCodeResults.dto";
import { ICustomCodeResult } from "@/dtos/CustomCodeRestults.dto";
import { ExecutionResultMapper } from "@/dtos/mappers/ExecutionResult";

/**
 * Class responsible for sending execution result to client.
 * 
 * @class
 * @implements {IExecutionResultService}
 */
@injectable()
export class ExecutionResultService implements IExecutionResultService {

    #_cacheProvider : ICacheProvider

    constructor(
        @inject(TYPES.ICacheProvider) cacheProvider : ICacheProvider
    ){
        this.#_cacheProvider = cacheProvider
    }

    async submitCodeResult(
        userId: string,
        submissionId: string
    ): Promise<ResponseDTO> {
        
        const cacheKey = `${REDIS_PREFIX.SUBMISSION_NORMAL_CACHE}:${submissionId}`

        const submissionResult = await this.#_cacheProvider.get(cacheKey) as ISubmissionResult | null;

        if(!submissionResult){
            return {
                data : null,
                success : false,
                errorMessage : ExecutionResultErrorType.SubmitCodeResultNotFound
            }
        }

        if(submissionResult.userId !== userId){
            return {
                data : null,
                success : false,
                errorMessage : ExecutionResultErrorType.UnauthorizedAccess
            }
        }

        await this.#_cacheProvider.del(cacheKey);

        const dto = ExecutionResultMapper.toSubmitCodeResultOutDTO(submissionResult);

        return {
            data : dto,
            success : true,
        }
    }

    async runCodeResult(userId: string): Promise<ResponseDTO> {
        
        const cacheKey = `${REDIS_PREFIX.RUN_CODE_NORMAL_CACHE}:${userId}`

        const runCodeResult = await this.#_cacheProvider.get(cacheKey) as IRunCodeResult | null;

        if(!runCodeResult){
            return {
                data : null,
                success : false,
                errorMessage : ExecutionResultErrorType.RunCodeResultNotFound
            }
        }

        if(runCodeResult.userId !== userId){
            return {
                data : null,
                success : false,
                errorMessage : ExecutionResultErrorType.UnauthorizedAccess
            }
        }

        await this.#_cacheProvider.del(cacheKey);

        const dto = ExecutionResultMapper.toRunCodeResultOutDTO(runCodeResult);

        return {
            data : dto,
            success : true,
        }
    }

    async customCodeResult(tempId: string): Promise<ResponseDTO> {
        
        const cacheKey = `${REDIS_PREFIX.CUSTOM_CODE_NORMAL_CACHE}:${tempId}`

        const customCodeResult = await this.#_cacheProvider.get(cacheKey) as ICustomCodeResult | null

        if(!customCodeResult){
            return {
                data : null,
                success : false,
                errorMessage : ExecutionResultErrorType.RunCodeResultNotFound
            }
        }

        if(customCodeResult.tempId !== tempId){
            return {
                data : null,
                success : false,
                errorMessage : ExecutionResultErrorType.UnauthorizedAccess
            }
        }

        await this.#_cacheProvider.del(cacheKey);

        const dto = ExecutionResultMapper.toCustomCodeResultOutDTO(customCodeResult);

        return {
            data : dto,
            success : true,
        }
    }
}
