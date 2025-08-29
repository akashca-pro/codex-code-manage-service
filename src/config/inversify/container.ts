import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'
import { IGrpcProblemService } from '@/infra/grpc/ProblemService.interface';
import { GrpcProblemService } from '@/infra/grpc/ProblemServices';
import { IMessageProvider } from '@/providers/messageProvider/IMessageProvider.interface';
import { NatsMessageProvider } from '../../providers/messageProvider/NatsMessageProvider';
import { ICacheProvider } from '@/providers/cacheProvider/ICacheProvider.interface';
import { RedisCacheProvider } from '@/providers/cacheProvider/RedisCacheProvider';
import { KafkaManager } from '@/libs/kafka/kafkaManager';
import { CodeSanitizer } from '@/utils/codeSanitize';
import { IProducerService } from '@/services/interface/producer.service.interface';
import { ProducerService } from '@/services/producer.service';
import { IConsumerService } from '@/services/interface/consumer.service.interface';
import { ConsumerService } from '@/services/consumer.service';
import { CodeManageHandler } from '@/transport/grpc/codeManage.handler';

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
container
    .bind<KafkaManager>(TYPES.KafkaManager)
    .toConstantValue(KafkaManager.getInstance());
container
    .bind<CodeSanitizer>(TYPES.CodeSanitizer)
    .to(CodeSanitizer);

// Producer service
container
    .bind<IProducerService>(TYPES.IProducerService)
    .to(ProducerService);

// Listener service
container
    .bind<IConsumerService>(TYPES.IConsumerService)
    .to(ConsumerService);

// Grpc server handler
container
    .bind<CodeManageHandler>(TYPES.CodeManageHandler)
    .to(CodeManageHandler);

export default container