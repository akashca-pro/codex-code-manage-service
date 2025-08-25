
export const NatsSubjectsPublish = {
  SUBMISSION_JOB: (submissionId : string) => `submission.jobs.${submissionId}`,
  SUBMISSION_RESULT : (submissionId : string) => `submission.results.${submissionId}`
} as const;

export const NatsSubjectsSubscribe = {
  SUBMISSION_RESULT: `submission.result.*`,
} as const

export type NatsSubject = typeof NatsSubjectsPublish[keyof typeof NatsSubjectsPublish];