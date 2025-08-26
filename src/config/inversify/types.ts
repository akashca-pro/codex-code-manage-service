
const TYPES = {

    // Providers
    IMessageProvider : Symbol.for("IMessageProvider"),
    ICacheProvider : Symbol.for("ICacheProvider"),

    // Grpc client calls
    IGrpcProblemService : Symbol.for("IGrpcProblemService"),

    // Publisher services
    ISubmitCodeExecPublisherService : Symbol.for("ISubmitCodeExecPublisherService"),
    IRunCodeExecPublisherService : Symbol.for("IRunCodeExecPublisherService"),
    ICustomCodeExecPublisherService : Symbol.for("ICustomCodeExecPublisherService"),
    
    // Listener services
    ISubmitCodeExecListenerService : Symbol.for("ISubmitCodeExecListenerService"),
    IRunCodeExecListenerService : Symbol.for("IRunCodeExecListenerService"),
    ICustomCodeExecListenerService : Symbol.for("ICustomCodeExecListenerService"),

    // Grpc server handlers
    GrpcSubmitCodeExecHandler : Symbol.for("GrpcSubmitCodeExecHandler"),
    GrpcRunCodeExecHandler : Symbol.for("GrpcRunCodeExecHandler"),
    GrpcCustomCodeExecHandler : Symbol.for("GrpcCustomCodeExecHandler"),

}

export default TYPES