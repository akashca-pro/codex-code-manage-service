
const TYPES = {

    // Providers
    IMessageProvider : Symbol.for("IMessageProvider"),
    ICacheProvider : Symbol.for("ICacheProvider"),
    KafkaManager : Symbol.for("KafkaManager"),
    CodeSanitizer : Symbol.for("CodeSanitizer"),

    // Grpc client calls
    IGrpcProblemService : Symbol.for("IGrpcProblemService"),

    // Producer Service
    IProducerService : Symbol.for("IProducerService"),
    
    // Listener service
    IConsumerService : Symbol.for("IConsumerService"),

    // Execution result service
    IExecutionResultService : Symbol.for("IExecutionResultService"),

    // Grpc server handler
    CodeManageHandler : Symbol.for("CodeManageHandler"),

}

export default TYPES