import { 
        Language as GrpcLanguageEnum, 
  } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

/**
 * Data Transfer Object (DTO) representing data to compile custom code.
 * 
 * @interface
 */
export interface ICustomCodeExecRequestDTO {
    userCode : string;
    language : GrpcLanguageEnum
}