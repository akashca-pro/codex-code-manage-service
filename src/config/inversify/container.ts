import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'
import { IGrpcProblemService } from '@/infra/grpc/ProblemService.interface';
import { GrpcProblemService } from '@/infra/grpc/ProblemServices';
import { IMessageProvider } from '@/providers/messageProvider/IMessageProvider.interface';
import { NatsMessageProvider } from '../../providers/messageProvider/NatsMessageProvider';

const container = new Container();

// Grpc client.
container
    .bind<IGrpcProblemService>(TYPES.IGrpcProblemService)
    .to(GrpcProblemService);

// Providers
container
.bind<IMessageProvider>(TYPES.IMessageProvider)
.to(NatsMessageProvider);