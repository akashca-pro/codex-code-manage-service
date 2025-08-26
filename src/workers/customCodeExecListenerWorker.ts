import 'reflect-metadata';
import container from '@/config/inversify/container';
import TYPES from '@/config/inversify/types';
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { IMessageProvider } from '@/providers/messageProvider/IMessageProvider.interface';
import { ICustomCodeExecListenerService } from '@/services/interface/customCodeExecListener.service.interface';

async function main(){
    const messageProvider = container.get<IMessageProvider>(TYPES.IMessageProvider);
    const listener = container.get<ICustomCodeExecListenerService>(TYPES.ICustomCodeExecListenerService);
    logger.info('[customCodeListener] Starting worker. . .');
    await messageProvider.connect();
    await listener.execute(); 
}

main().catch(err=>{
    logger.error('[CodeExecListener] Fatal startup error:', err);
    process.exit(1);
});
