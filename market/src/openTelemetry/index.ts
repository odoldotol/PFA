import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
// import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
// import { DebuggerConsoleSpanExporter } from './debuggerConsoleSpanExporter';

const sdk = new NodeSDK({
  // spanProcessor: new SimpleSpanProcessor(new DebuggerConsoleSpanExporter()),
  instrumentations: [ getNodeAutoInstrumentations() ],
  textMapPropagator: new W3CTraceContextPropagator(),
});

sdk.start();

console.log('OpenTelemetry initialized');

export { getSpanId } from './getSpanId';
export { getTraceId } from './getTraceId';