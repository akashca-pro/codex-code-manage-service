import { 
        Difficulty as GrpcDifficultyEnum,
        Language as GrpcLanguageEnum 
  } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { SubmitCodeExecRequest } from '@akashcapro/codex-shared-utils/dist/proto/compiled/internal/code_manage'
import { ICreateSubmissionRequestDTO } from "../CreateSubmission.dto";
import { Difficulty } from "@/enums/Difficulty.enum";
import { Language } from "@/enums/Language.enum";


export class SubmissionMapper {

    static toCreateSubmissionDTO (
        data : SubmitCodeExecRequest, 
        addons : {title : string, difficulty : GrpcDifficultyEnum} 
    ) : ICreateSubmissionRequestDTO {
        return {
            ...data,
            title : addons.title,
            difficulty : addons.difficulty
        }
    }

    private static _mapGrpcDifficultyEnum(difficulty : GrpcDifficultyEnum) : Difficulty {
        if (difficulty === 1) {
            return Difficulty.EASY;
        } else if (difficulty === 2) {
            return Difficulty.MEDIUM;
        } else if (difficulty === 3) {
            return Difficulty.HARD;
        } else {
            throw new Error('Invalid difficulty value');
        }   
    }

    private static _mapGrpcLanguageEnum(language : GrpcLanguageEnum) : Language {
        if(language === 1){
            return Language.JAVASCRIPT;
        } else if (language === 2){
            return Language.PYTHON
        } else {
            throw new Error('Invalid choosen language')
        }
    }

}