import { CounterMetrics } from '../../entities/Metrics';
import { WhatsAppService } from '../../services/message/WhatsAppService';
import { MetricsService } from '../../services/telemetry/MetricsService';

interface Command {
	messageId: string;
	user: string;
}

export class SendFeedbackForm {
	public constructor(
		private messageService: WhatsAppService,
		private metricsService?: MetricsService,
	) {}

	public async process(command: Command) {
		const userNumber = command.user;
		const messageId = command.messageId;

		await this.metricsService?.incrementCounter(CounterMetrics.SEND_FEEDBACK_FROM_REQUESTED);

		try {
			await this.messageService.sendMessage(
				userNumber,
				{
					body: 'Aquí tienes el link para dar feedback: https://forms.gle/MnHm2U85EFkK9Zj27',
				},
				messageId,
			);
			await this.messageService.addReaction(messageId, '✅', userNumber);
		} catch (error) {
			await this.metricsService?.incrementCounter(CounterMetrics.SEND_FEEDBACK_FROM_FAILED);
			await this.messageService.addReaction(messageId, '❌', userNumber);

			throw error;
		}
	}
}
