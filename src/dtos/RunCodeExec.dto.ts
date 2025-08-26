import { 
        Language as GrpcLanguageEnum,
        TestCase, 
  } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

/**
 * DTO (Data Transfer Object) represent the structure of run code execution 
 * payload coming from gRPC gateway.
 * 
 * @interface
 */
export interface IRunCodeExecRequestDTO {
    problemId : string;
    userId : string;
    language : GrpcLanguageEnum
    userCode : string;
    testCases : TestCase[];
}

