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

// Listener services
container
    .bind<SubmitCodeExecListener>(TYPES.SubmitCodeExecListener)
    .to(SubmitCodeExecListener);

export default container