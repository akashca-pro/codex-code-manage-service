import { 
        Difficulty as GrpcDifficultyEnum,
        Language as GrpcLanguageEnum, 
  } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

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
