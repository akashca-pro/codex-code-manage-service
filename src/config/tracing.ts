import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { config } from '.';
import logger from '@/utils/pinoLogger';
import dotenv from 'dotenv'
dotenv.config();

const serviceName = process.env.OTEL_SERVICE_NAME || config.SERVICE_NAME
const otelCollectorEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'otel-collector.observability.svc.cluster.local:4317';

const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
})

// --- Exporter Configuration ---
// Note: We use the same endpoint for all three signals.
// The '/v1/traces', '/v1/metrics', '/v1/logs' paths are appended automatically by the exporters.
const traceExporter = new OTLPTraceExporter({
  url: otelCollectorEndpoint,
});

const metricExporter = new OTLPMetricExporter({
  url: otelCollectorEndpoint,
});

const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000, // Export metrics every 10 seconds
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
        // Disable instrumentations that you don't need or that are too noisy.
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

// Start the SDK
try {
  sdk.start();
  logger.info(`OpenTelemetry tracing initialized for service: ${serviceName}`);
} catch (error) {
  logger.info('Error initializing OpenTelemetry tracing', error);
}

export default sdk;