import * as opentelemetry from '@opentelemetry/api';

import { MetricsService } from './MetricsService';

export class OpenTelemetryMetricsService implements MetricsService {
	private meter: opentelemetry.Meter;

	public constructor() {
		this.meter = opentelemetry.metrics.getMeter('resumico');
	}

	public async incrementCounter(metric: string): Promise<void> {
		this.meter.createCounter(metric).add(1);
	}

	public async recordHistogram(histogram: string, value: number): Promise<void> {
		this.meter.createHistogram(histogram).record(value);
	}
}
