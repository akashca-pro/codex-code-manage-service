import express, { Request, Response } from 'express';
import { register } from './metrics';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';

export const startMetricsServer = (port : number)  => {

    const app = express();

    app.get('/metrics',async (req : Request,res : Response)=>{
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    })

    app.listen(port, ()=>{
        logger.info(`Metrics server listening on port ${port}`)
    })

}   