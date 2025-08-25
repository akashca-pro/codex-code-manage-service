import 'reflect-metadata';
import container from '@/config/inversify/container';
import TYPES from '@/config/inversify/types';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { IMessageProvider } from '@/providers/messageProvider/IMessageProvider.interface';
import { IRunCodeExecListenerService } from '@/services/interface/runCodeExecListener.service.interface';

async function main(){
    const messageProvider = container.get<IMessageProvider>(TYPES.IMessageProvider);
    const listener = container.get<IRunCodeExecListenerService>(TYPES.IRunCodeExecListenerService);
    logger.info('[submitCodeExecListener] Starting worker. . .');
    await messageProvider.connect();
    await listener.execute(); 
}

main().catch(err=>{
    logger.error('[CodeExecListener] Fatal startup error:', err);
    process.exit(1);
});
