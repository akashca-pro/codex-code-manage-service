import { Language } from "@/enums/Language.enum";
import { TestCase } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

export interface ISubmissionExecJobPayload {
    submissionId : string;
    executableCode :string;
    language : Language;
    userId : string;
    testCases : {
        Id : string;
        input : string;
        output : string;
    }[];
}

export interface IRunCodeExecJobPayload {
    problemId : string;
    tempId : string;
    language : Language;
    userCode : string;
    executableCode : string;
    testCases : TestCase[];
}

export interface ICustomCodeExecJobPayload {
    tempId : string;
    userCode : string;
    language : Language;
}