
export const NatsSubjectsPublish = {
  SUBMISSION_JOB: (submissionId : string) => `submission.jobs.${submissionId}`,
  SUBMISSION_RESULT : (submissionId : string) => `submission.results.${submissionId}`,

  RUN_JOB : (userId : string) => `run.jobs.${userId}`,
  RUN_RESULT : (userId : string) => `run.jobs.${userId}`
} as const;

export const NatsSubjectsSubscribe = {
  SUBMISSION_RESULT: `submission.result.*`,
  RUN_RESULT : `run.result.*`
} as const

export type NatsSubject = typeof NatsSubjectsPublish[keyof typeof NatsSubjectsPublish];