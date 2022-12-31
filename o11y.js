/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
'use strict';

const process = require('process');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');

const traceExporter = new OTLPTraceExporter({
	headers: {
		'api-key': process.env.OTEL_TOKEN,
	},
});

const metricReader = new PeriodicExportingMetricReader({
	exporter: new OTLPMetricExporter({
		headers: {
			'api-key': process.env.OTEL_TOKEN,
		},
	}),
	exportIntervalMillis: 1000,
});

const sdk = new NodeSDK({
	traceExporter,
	instrumentations: [getNodeAutoInstrumentations()],
	metricReader,
});

sdk
	.start()
	.then(() => console.log('Tracing initialized'))
	.catch((error) => console.log('Error initializing tracing', error));

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
	sdk
		.shutdown()
		.then(() => console.log('Tracing terminated'))
		.catch((error) => console.log('Error terminating tracing', error))
		.finally(() => process.exit(0));
});
