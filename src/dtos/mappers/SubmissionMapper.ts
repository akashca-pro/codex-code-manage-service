import { 
        Difficulty as GrpcDifficultyEnum,
        Language as GrpcLanguageEnum, 
  } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { ICreateSubmissionInputDTO, ICreateSubmissionRequestDTO } from "../CreateSubmission.dto";
import { Difficulty } from "@/enums/Difficulty.enum";
import { Language } from "@/enums/Language.enum";
import { isValidCountry } from "@/utils/countryCheck";
import { SubmissionErrorType } from "@/enums/Error/submissionErrorType.enum";

class SubmissionMapper {

    static toSubmissionExecService(body : ICreateSubmissionInputDTO ) : ICreateSubmissionRequestDTO {
        
        if(body.country && !isValidCountry(body.country)){
            throw new Error(SubmissionErrorType.InvalidCountryCode)
        }

        return {
            problemId : body.problemId,
            title : body.title,
            userId : body.userId,
            ...(body.battleId ? { battleId : body.battleId } : {}),
            ...(body.country ? { country : body.country } : {}),
            userCode : body.userCode,
            difficulty : this._mapGrpcDifficultyEnum(body.difficulty),
            language : this._mapGrpcLanguageEnum(body.language),
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