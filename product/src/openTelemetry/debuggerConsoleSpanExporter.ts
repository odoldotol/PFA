import {
  SpanExporter,
  ReadableSpan
} from '@opentelemetry/sdk-trace-base';
import {
  ExportResult,
  ExportResultCode
} from '@opentelemetry/core';

export class DebuggerConsoleSpanExporter
  implements SpanExporter
{
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    for (const span of spans) {
      const { traceId } = span.spanContext();

      // HrTime 을 밀리 세컨드로 변환하기
      const duration = span.duration[0] * 1e3 + span.duration[1] / 1e6;

      console.log(`${span.status.code} | ${duration.toFixed(2).toString().padStart(8)}ms | ${traceId} | ${this.removeNewLineAndSpaces(span.name)} | ${this.removeNewLineAndSpaces(this.getAttr(span))}`);
      if (span.status.code !== 0) {
        console.error(`└ Message: ${span.status.message ? this.removeNewLineAndSpaces(span.status.message) : 'N/A'}`);
      }
    }

    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  private getAttr(span: ReadableSpan): string {
    const spanName = span.name.toLowerCase();

    switch (true) {
      case spanName === 'tcp.connect':
        return `${span.attributes['net.transport']} ${span.attributes['net.peer.name']}:${span.attributes['net.peer.port']}`;
      case spanName === 'dns.lookup':
        return `${span.attributes['peer.ipv4']}`;
      case spanName === 'pg.connect':
        return `${span.attributes['db.connection_string']}`;
      case spanName === 'pg-pool.connect':
        return `${span.attributes['db.connection_string']}`;
      case /^pg.query/.test(spanName):
        return `${(span.attributes['db.statement'] as string)?.substring(0, 60)}...`;
      case spanName === 'tls.connect':
        return `${span.attributes['tls.protocol']}`;
      case
      spanName === 'get' ||
      spanName === 'post' ||
      spanName === 'put' ||
      spanName === 'delete' ||
      spanName === 'patch' ||
      spanName === 'options' ||
      spanName === 'head':
        return `${span.attributes['http.url']} ${span.attributes['http.status_code']}`;
      case /^(get|post|put|delete|patch|options|head)/.test(spanName):
        return `${span.attributes['http.status_code']}`;
      case spanName === 'ipc.connect':
        return `${span.attributes['net.transport']} ${span.attributes['net.peer.name']}`;
      case /^middleware/.test(spanName):
        return `${span.attributes['http.route']}`;
      case /^request/.test(spanName):
        return ``;
      default:
        return JSON.stringify(span.attributes, null, 2);
    }
  }

  private removeNewLineAndSpaces(str: string): string {
    return str
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  }

}
