import { 
    Difficulty as GrpcDifficultyEnum, 
    Language as GrpcLanguageEnum, 
    } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Language } from "./Language.enum";

export class Mapper {

    public static mapGrpcLanguageEnum(language : GrpcLanguageEnum) : Language {
        if(language === 1){
            return Language.JAVASCRIPT;
        } else if (language === 2){
            return Language.PYTHON
        } else {
            throw new Error('Invalid choosen language')
        }
    }

}