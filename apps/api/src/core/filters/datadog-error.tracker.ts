import { Injectable } from '@znight/core';
import { type ExceptionMapper } from '@znight/http';
import tracer from 'dd-trace';
import { USER_KEEP } from 'dd-trace/ext/priority';

/** Tags the root span of the active Datadog trace with the error, and keeps the trace. */
export function trackErrorWithDatadog(error: unknown): void {
  const span = tracer.scope().active();

  if (span) {
    // biome-ignore lint/suspicious/noExplicitAny: private dd-trace API
    const spanContext = span.context() as any;
    // Hack to force the sampling priority to 1
    spanContext._sampling.priority = USER_KEEP;

    // Hack to retrieve the root span from Datadog
    // @see https://github.com/DataDog/dd-trace-js/issues/725
    const rootSpan = spanContext._trace.started[0];
    rootSpan?.setTag('error', error);
  }
}

/** First exception mapper of the HTTP pipeline: reports the error to Datadog, then lets the next mappers answer. */
@Injectable()
export class DatadogErrorTracker implements ExceptionMapper {
  map(error: unknown): undefined {
    trackErrorWithDatadog(error);
    return;
  }
}
