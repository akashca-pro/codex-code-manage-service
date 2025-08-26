
export const NatsSubjectsPublish = {
  SUBMISSION_JOB: (submissionId : string) => `submission.job.${submissionId}`,
  SUBMISSION_RESULT : (submissionId : string) => `submission.result.${submissionId}`,

  RUN_JOB : (userId : string) => `run.job.${userId}`,
  RUN_RESULT : (userId : string) => `run.result.${userId}`,

  CUSTOM_JOB : (tempId : string) => `custom.job.${tempId}`,
  CUSTOM_RESULT : (tempId : string) => `custom.result.${tempId}` 
} as const;

export const NatsSubjectsSubscribe = {
  SUBMISSION_RESULT: `submission.result.*`,
  RUN_RESULT : `run.result.*`,
  CUSTOM_RESULT : `custom.result.*`
} as const

export type NatsSubject = typeof NatsSubjectsPublish[keyof typeof NatsSubjectsPublish];