import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'
import { IGrpcProblemService } from '@/infra/grpc/ProblemService.interface';
import { GrpcProblemService } from '@/infra/grpc/ProblemServices';
import { IMessagingService } from '@/providers/messagingService/messagingService.interface';
import { NatsMessagingService } from '../nats/messagingService';

const container = new Container();

// Grpc client.
container
    .bind<IGrpcProblemService>(TYPES.IProblemService)
    .to(GrpcProblemService);


// Providers
container
    .bind<IMessagingService>(TYPES.IMessagingService)
    .to(NatsMessagingService);