import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'
import { IGrpcProblemService } from '@/infra/grpc/ProblemService.interface';
import { GrpcProblemService } from '@/infra/grpc/ProblemServices';
import { IMessageProvider } from '@/providers/messageProvider/IMessageProvider.interface';
import { NatsMessageProvider } from '../../providers/messageProvider/NatsMessageProvider';
import { ISubmitCodeExecPublisherService } from '@/services/interface/submitCodeExecPublisher.service.interface';
import { SubmitCodeExecPublisherService } from '@/services/submitCodeExecPublisher.service';
import { ICacheProvider } from '@/providers/cacheProvider/ICacheProvider.interface';
import { RedisCacheProvider } from '@/providers/cacheProvider/RedisCacheProvider';
import { SubmitCodeExecListener } from '@/services/submitCodeExecListener.service';
import { IRunCodeExecPublisherService } from '@/services/interface/runCodeExecPublisher.service.interface';
import { RunCodeExecPublisherService } from '@/services/runCodeExecPublisher.service';
import { IRunCodeExecListenerService } from '@/services/interface/runCodeExecListener.service.interface';
import { RunCodeExecListenerService } from '@/services/runCodeExecListener.service';
import { ISubmitCodeExecListenerService } from '@/services/interface/submitCodeExecListener.service.interface';
import { ICustomCodeExecPublisherService } from '@/services/interface/customCodeExecPublisher.service.interface';
import { CustomCodeExecPublishService } from '@/services/customCodeExecPublisher.service';

const container = new Container();

// Grpc client.
container
    .bind<IGrpcProblemService>(TYPES.IGrpcProblemService)
    .to(GrpcProblemService);

// Providers
container
    .bind<IMessageProvider>(TYPES.IMessageProvider)
    .to(NatsMessageProvider);
container
    .bind<ICacheProvider>(TYPES.ICacheProvider)
    .to(RedisCacheProvider);

// Publisher services
container   
    .bind<ISubmitCodeExecPublisherService>(TYPES.ISubmitCodeExecPublisherService)
    .to(SubmitCodeExecPublisherService);
container
    .bind<IRunCodeExecPublisherService>(TYPES.IRunCodeExecPublisherService)
    .to(RunCodeExecPublisherService);
container
    .bind<ICustomCodeExecPublisherService>(TYPES.ICustomCodeExecPublisherService)
    .to(CustomCodeExecPublishService);

// Listener services
container
    .bind<ISubmitCodeExecListenerService>(TYPES.ISubmitCodeExecListenerService)
    .to(SubmitCodeExecListener);
container
    .bind<IRunCodeExecListenerService>(TYPES.IRunCodeExecListenerService)
    .to(RunCodeExecListenerService);

export default container