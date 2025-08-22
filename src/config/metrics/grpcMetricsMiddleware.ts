import { grpcRequestCounter, grpcLatency } from "./metrics"; 

export const grpcMetricsCollector = (methodName: string, handler: Function) => {
  return async (call: any, callback: Function) => {
    const start = Date.now();
    try {
      grpcRequestCounter.inc({ method: methodName, status: "OK" });
      await handler(call, callback); // invoke original handler
      const duration = Date.now() - start;
      grpcLatency.observe({ method: methodName, status: "OK" }, duration);
    } catch (err) {
      const duration = Date.now() - start;
      grpcRequestCounter.inc({ method: methodName, status: "ERROR" });
      grpcLatency.observe({ method: methodName, status: "ERROR" }, duration);
      throw err;
    }
  };
};