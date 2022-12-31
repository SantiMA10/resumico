import { CounterMetrics, HistogramMetrics } from '../../entities/Metrics';
import { WhatsAppService } from '../../services/message/WhatsAppService';
import { SpeechToTextService } from '../../services/speechToText/SpeechToTextService';
import { MetricsService } from '../../services/telemetry/MetricsService';

interface Command {
	messageId: string;
	user: string;
	audioId: string;
}

export class SendTranscription {
	public constructor(
		private messageService: WhatsAppService,
		private speechToTextService: SpeechToTextService,
		private metricsService?: MetricsService,
	) {}

	public async process(command: Command) {
		const audioId = command.audioId;
		const userNumber = command.user;
		const messageId = command.messageId;

		await this.metricsService?.incrementCounter(CounterMetrics.SEND_TRANSCRIPTION_STARTED);
		const startTime = new Date().getTime();

		try {
			const { filePath } = await this.messageService.downloadAudio(audioId);
			const { text } = await this.speechToTextService.transcribe(filePath, audioId);

			await this.messageService.sendMessage(
				userNumber,
				{
					header: 'Aquí tienes la transcripción:',
					body: text,
				},
				messageId,
			);
			await this.messageService.addReaction(messageId, '✅', userNumber);
			await this.metricsService?.incrementCounter(CounterMetrics.SEND_TRANSCRIPTION_COMPLETED);
			const endTime = new Date().getTime();
			await this.metricsService?.recordHistogram(
				HistogramMetrics.SEND_TRANSCRIPTION_TOTAL_TIME,
				endTime - startTime,
			);
		} catch (error) {
			await this.metricsService?.incrementCounter(CounterMetrics.SEND_TRANSCRIPTION_FAILED);
			await this.messageService.addReaction(messageId, '❌', userNumber);

			throw error;
		}
	}
}
