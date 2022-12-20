export interface SummaryService {
	summarize(message: string): Promise<string>;
}
