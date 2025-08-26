
const TYPES = {

    // Providers
    IMessageProvider : Symbol.for("IMessageProvider"),
    ICacheProvider : Symbol.for("ICacheProvider"),

    // Grpc client
    IGrpcProblemService : Symbol.for("IGrpcProblemService"),

    // Publisher services
    ISubmitCodeExecPublisherService : Symbol.for("ISubmitCodeExecPublisherService"),
    IRunCodeExecPublisherService : Symbol.for("IRunCodeExecPublisherService"),
    ICustomCodeExecPublisherService : Symbol.for("ICustomCodeExecPublisherService"),
    
    // Listener services
    ISubmitCodeExecListenerService : Symbol.for("ISubmitCodeExecListenerService"),
    IRunCodeExecListenerService : Symbol.for("IRunCodeExecListenerService"),
    ICustomCodeExecListenerService : Symbol.for("ICustomCodeExecListenerService"),

}

export default TYPES