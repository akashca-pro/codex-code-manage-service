import { IMessageProvider } from "@/providers/messageProvider/IMessageProvider.interface";
import { IRunCodeExecPublisherService } from "./interface/runCodeExecPublisher.service.interface";
import { inject, injectable } from "inversify";
import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/Response.dto";
import { IRunCodeExecInputDTO } from "@/dtos/RunCodeExec.dto";
import { CodeSanitizer } from "@/utils/codeSanitize";
import { Mapper } from "@/enums/Mapper";
import { NatsSubjectsPublish } from "@/config/nats/natsSubjects";
import { NatsStreams } from "@/config/nats/natsStreams";


/**
 * Implementation of the run code execution publisher service.
 * 
 * @class
 * @implements {IRunCodeExecPublisherService}
 */
@injectable()
export class RunCodeExecPublisherService implements IRunCodeExecPublisherService {

    #_messageProvider : IMessageProvider

    constructor(
        @inject(TYPES.IMessageProvider)
        messageProvider : IMessageProvider
    ){
        this.#_messageProvider = messageProvider
    }

    async execute(data: IRunCodeExecInputDTO): Promise<ResponseDTO> {
        
        const sanitizer = new CodeSanitizer();

        const language = Mapper.mapGrpcLanguageEnum(data.language);

        const { isValid, error } = sanitizer.sanitize(data.userCode,language);

        if(!isValid){
            return {
                data : null,
                success : false,
                errorMessage : error
            }
        }

        const jobPayload = {
            ...data,
            language
        };

        await this.#_messageProvider.publishToStream(
            NatsSubjectsPublish.RUN_JOB(jobPayload.userId),
            NatsStreams.RUN_JOBS,
            jobPayload
        );

        return {
            data : null,
            success : true
        }
    }   
}