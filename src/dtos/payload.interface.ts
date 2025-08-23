
interface JobPayload {
    submissionId: string;
    userCode: string;
    language: string;
    // ... other relevant fields
}

interface ResultPayload {
    submissionId: string;
    status: 'COMPLETED' | 'FAILED' | 'ERROR';
    score: number;
    // ... other result fields
}