import { CounterMetrics, HistogramMetrics } from '../../entities/Metrics';
import { WhatsAppService } from '../../services/message/WhatsAppService';
import { SpeechToTextService } from '../../services/speechToText/SpeechToTextService';
import { SummaryService } from '../../services/summary/SummaryService';
import { MetricsService } from '../../services/telemetry/MetricsService';

interface Command {
	messageId: string;
	user: string;
	audioId: string;
}

export class SendSummary {
	public constructor(
		private messageService: WhatsAppService,
		private speechToTextService: SpeechToTextService,
		private summarizeService: SummaryService,
		private metricsService?: MetricsService,
	) {}

	public async process(command: Command) {
		const audioId = command.audioId;
		const userNumber = command.user;
		const messageId = command.messageId;

		await this.metricsService?.incrementCounter(CounterMetrics.SEND_SUMMARY_STARTED);
		const startTime = new Date().getTime();

		try {
			const { filePath } = await this.messageService.downloadAudio(audioId);
			const { text } = await this.speechToTextService.transcribe(filePath, audioId);

			const summary = await this.summarizeService.summarize(text);
			if (!summary) {
				await this.messageService.addReaction(messageId, '❌', userNumber);
				console.log('skipping summary due to an error in the service');
				return;
			}

			await this.messageService.sendMessage(
				userNumber,
				{
					header: 'Aquí tienes un resumen:',
					body: summary,
				},
				messageId,
			);
			await this.messageService.addReaction(messageId, '✅', userNumber);
			await this.metricsService?.incrementCounter(CounterMetrics.SEND_SUMMARY_COMPLETED);
			const endTime = new Date().getTime();
			await this.metricsService?.recordHistogram(
				HistogramMetrics.SEND_SUMMARY_TOTAL_TIME,
				endTime - startTime,
			);
		} catch (error) {
			await this.metricsService?.incrementCounter(CounterMetrics.SEND_SUMMARY_FAILED);
			await this.messageService.addReaction(messageId, '❌', userNumber);

			throw error;
		}
	}
}
