import { Difficulty } from "@/enums/Difficulty.enum";
import { Language } from "@/enums/Language.enum";
import CountryCode from "@akashcapro/codex-shared-utils/enums/countryCode.enum";
import { 
        Difficulty as GrpcDifficultyEnum,
        Language as GrpcLanguageEnum, 
  } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

/**
 * DTO (Data Transfer Object) represent the structure of created submission object by entity.
 * 
 * @interface 
 */
export interface ICreateSubmissionInputDTO {
    problemId : string;
    userId : string;
    battleId? : string;
    country? : string;
    title : string;
    language : GrpcLanguageEnum;
    userCode : string;
    difficulty : GrpcDifficultyEnum;
}

/**
 * Data Transfer Object (DTO) representing data to create submission document.
 *
 * @interface
 */
export interface ICreateSubmissionRequestDTO {

    problemId : string;
    userId : string;
    battleId? : string;
    country? : string;
    title : string;
    language : GrpcLanguageEnum;
    userCode : string;
    difficulty : GrpcDifficultyEnum;
}
