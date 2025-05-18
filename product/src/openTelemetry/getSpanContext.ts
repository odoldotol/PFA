import {
  trace,
  context,
  SpanContext
} from '@opentelemetry/api';

export const getSpanContext = (): SpanContext | undefined => trace.getSpan(context.active())?.spanContext();