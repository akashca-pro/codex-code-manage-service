import 'reflect-metadata'
import { Container } from "inversify";
import TYPES from './types'
import { IGrpcProblemService } from '@/infra/grpc/ProblemService.interface';
import { GrpcProblemService } from '@/infra/grpc/ProblemServices';
import { ICacheProvider } from '@/providers/ICacheProvider.interface';
import { RedisCacheProvider } from '@/providers/RedisCacheProvider';
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
    .to(GrpcProblemService)
    .inSingletonScope();

// Providers
container
    .bind<ICacheProvider>(TYPES.ICacheProvider)
    .to(RedisCacheProvider)
    .inSingletonScope();
container
    .bind<KafkaManager>(TYPES.KafkaManager)
    .toConstantValue(KafkaManager.getInstance());
container
    .bind<CodeSanitizer>(TYPES.CodeSanitizer)
    .to(CodeSanitizer)
    .inSingletonScope();

// Producer service
container
    .bind<IProducerService>(TYPES.IProducerService)
    .to(ProducerService)
    .inSingletonScope();

// Listener service
container
    .bind<IConsumerService>(TYPES.IConsumerService)
    .to(ConsumerService)
    .inSingletonScope();

// Grpc server handler
container
    .bind<CodeManageHandler>(TYPES.CodeManageHandler)
    .to(CodeManageHandler)
    .inSingletonScope();

export default container