import { NextFunction, Request, Response } from 'express';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';

export const globalErrorHandler = (
    err: Error,
    req : Request, 
    res : Response, 
    next : NextFunction)=>{

    logger.error('Unexpected error : ',err);
    
    process.exit(1);
}