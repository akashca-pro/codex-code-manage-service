
export const REDIS_PREFIX = {
    SUBMISSION_NORMAL_CACHE : 'submission:normal',
    RUN_CODE_NORMAL_CACHE : 'run:normal',

    SUBMISSION_BATTLE_CACHE : 'submission:battle',
    RUN_CODE_BATTLE_CACHE : 'run:battle',

    CUSTOM_CODE_NORMAL_CACHE : 'custom:normal',

    KAFKA_IDEMPOTENCY_KEY : 'processed',
    THROTTLE_KEY : 'throttle:user',

    PROBLEM_DETAILS : 'problem:details'
} as const