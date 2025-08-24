import { inject, injectable } from "inversify";
import { ISubmitCodeExecService } from "./interface/submitCodeExec.service.interface";
import { IGrpcProblemService } from "@/infra/grpc/ProblemService.interface";
import TYPES from "@/config/inversify/types";
import { ICreateSubmissionRequestDTO } from "@/dtos/CreateSubmission.dto";
import { ResponseDTO } from "@/dtos/Response.dto";
import { IMessageProvider } from "@/providers/messageProvider/IMessageProvider.interface";
import { CodeSanitizer } from "@/utils/codeSanitize";
import { Mapper } from "@/enums/Mapper";

/**
 * Implementation of the submit code execution service.
 * 
 * @class
 * @implements {ISubmitCodeExecService}
 */
@injectable()
export class SubmitCodeExecService implements ISubmitCodeExecService {

    #_problemGrpcClient : IGrpcProblemService
    #_messageProvider : IMessageProvider

    constructor(
        @inject(TYPES.IGrpcProblemService)
        problemGrpcClient : IGrpcProblemService,

        @inject(TYPES.IMessageProvider)
        messagingService : IMessageProvider
    ){
        this.#_problemGrpcClient = problemGrpcClient
        this.#_messageProvider = messagingService
    }

    async execute(data: ICreateSubmissionRequestDTO): Promise<ResponseDTO> {

        const sanitizer = new CodeSanitizer();

        const language = Mapper.mapGrpcLanguageEnum(data.language)

        const { isValid, error } = sanitizer.sanitize(data.userCode,language);

        if(!isValid){
            return {
                data : null,
                success : false,
                errorMessage : error
            }
        }
        
        const problem = await this.#_problemGrpcClient.getProblem({ Id : data.problemId });

        const submission = await this.#_problemGrpcClient.createSubmission(data);

        this.#_messageProvider.publish('submission.jobs',{
            submissionId : submission.Id,
            userCode : data.userCode,
            language : data.language,
            testCases : problem.testcaseCollection?.submit
        })

        return {
            data : submission.Id,
            success : true
        }
    }
}

