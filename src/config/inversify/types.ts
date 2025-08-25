
const TYPES = {

    // Providers
    IMessageProvider : Symbol.for("IMessageProvider"),
    ICacheProvider : Symbol.for("ICacheProvider"),

    // Grpc client
    IGrpcProblemService : Symbol.for("IGrpcProblemService"),

    // Publisher services
    ISubmitCodeExecPublisherService : Symbol.for("ISubmitCodeExecPublisherService"),
    
    // Listener services
    SubmitCodeExecListener : Symbol.for("SubmitCodeExecListener"),

}

export default TYPES