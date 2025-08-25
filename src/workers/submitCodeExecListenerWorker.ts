import 'reflect-metadata';
import container from '@/config/inversify/container';
import TYPES from '@/config/inversify/types';
import { SubmitCodeExecListener } from '@/services/submitCodeExecListener.service'
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { IMessageProvider } from '@/providers/messageProvider/IMessageProvider.interface';

async function main(){
    const messageProvider = container.get<IMessageProvider>(TYPES.IMessageProvider);
    const listener = container.get<SubmitCodeExecListener>(TYPES.SubmitCodeExecListener);
    logger.info('[submitCodeExecListener] Starting worker. . .');
    await messageProvider.connect();
    await listener.execute(); 
}

main().catch(err=>{
    logger.error('[CodeExecListener] Fatal startup error:', err);
    process.exit(1);
});
