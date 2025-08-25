import { inject, injectable } from "inversify";
import { ISubmitCodeExecPublisherService } from "./interface/submitCodeExecPublisher.service.interface";
import { IGrpcProblemService } from "@/infra/grpc/ProblemService.interface";
import TYPES from "@/config/inversify/types";
import { ICreateSubmissionRequestDTO } from "@/dtos/CreateSubmission.dto";
import { ResponseDTO } from "@/dtos/Response.dto";
import { IMessageProvider } from "@/providers/messageProvider/IMessageProvider.interface";
import { CodeSanitizer } from "@/utils/codeSanitize";
import { Mapper } from "@/enums/Mapper";
import { NatsSubjectsPublish } from "@/config/nats/natsSubjects";
import { NatsStreams } from "@/config/nats/natsStreams";

/**
 * Implementation of the submit code execution publisher service.
 * 
 * @class
 * @implements {ISubmitCodeExecPublisherService}
 */
@injectable()
export class SubmitCodeExecPublisherService implements ISubmitCodeExecPublisherService {

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

        const jobPayload = {
            submissionId : submission.Id,
            userCode : data.userCode,
            language : data.language,
            userId : data.userId,
            testCases : problem.testcaseCollection?.submit
        }

        await this.#_messageProvider.publishToStream(
            NatsSubjectsPublish.SUBMISSION_JOB(jobPayload.submissionId),
            NatsStreams.SUBMISSION_JOBS,
            jobPayload
        );

        return {
            data : submission.Id,
            success : true
        }
    }
}

