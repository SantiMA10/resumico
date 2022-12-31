export interface MetricsService {
	incrementCounter(metric: string): Promise<void>;
	recordHistogram(histogram: string, value: number): Promise<void>;
}
