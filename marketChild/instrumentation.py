from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
# from opentelemetry.sdk.trace.export import (BatchSpanProcessor, ConsoleSpanExporter)
# from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

provider = TracerProvider()
# provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
# provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))

trace.set_tracer_provider(provider)