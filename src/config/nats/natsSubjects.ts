
export const NatsSubjects = {
  SUBMISSION_JOB: 'submission.jobs',
  SUBMISSION_RESULT: 'submission.results',
} as const;

export type NatsSubject = typeof NatsSubjects[keyof typeof NatsSubjects];