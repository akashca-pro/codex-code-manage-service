import { grpcMetricsCollector } from "@/config/metrics/grpcMetricsMiddleware";

// function to wrap all service handler with grpcMetricsCollector function.
export function wrapAll(serviceObj : Record<string,Function>) {
    return Object.fromEntries(
        Object.entries(serviceObj).map(([name, fn])=> [
            name,
            grpcMetricsCollector(name, fn)
        ])
    )
}