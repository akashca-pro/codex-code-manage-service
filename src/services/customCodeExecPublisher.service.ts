import { inject, injectable } from "inversify";
import { ICustomCodeExecPublisherService } from "./interface/customCodeExecPublisher.service.interface";
import { IMessageProvider } from "@/providers/messageProvider/IMessageProvider.interface";
import TYPES from "@/config/inversify/types";
import { ICustomCodeExecRequestDTO } from "@/dtos/CompileCodeExec.dto";
import { ResponseDTO } from "@/dtos/Response.dto";
import { CodeSanitizer } from "@/utils/codeSanitize";
import { Mapper } from "@/enums/Mapper";
import { NatsSubjectsPublish } from "@/config/nats/natsSubjects";
import { NatsStreams } from "@/config/nats/natsStreams";

/**
 * Implementation of the custom code execution publisher service.
 * 
 * @class
 * @implements {ICustomCodeExecPublisherService}
 */
@injectable()
export class CustomCodeExecPublishService implements ICustomCodeExecPublisherService {

    #_messageProvider : IMessageProvider

    constructor(
        @inject(TYPES.IMessageProvider)
        messageProvider : IMessageProvider
    ){
        this.#_messageProvider = messageProvider
    }

    async execute(data: ICustomCodeExecRequestDTO): Promise<ResponseDTO> {
        
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

        await this.#_messageProvider.publishToStream(
            NatsSubjectsPublish.CUSTOM_JOB(data.tempId),
            NatsStreams.CUSTOM_JOBS,
            data
        )

        return {
            data : null,
            success : true,
        }
    }
}


