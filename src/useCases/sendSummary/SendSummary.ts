import { WhatsAppService } from '../../services/message/WhatsAppService';
import { SpeechToTextService } from '../../services/speechToText/SpeechToTextService';
import { SummaryService } from '../../services/summary/SummaryService';

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
	) {}

	public async process(command: Command) {
		const audioId = command.audioId;
		const userNumber = command.user;
		const messageId = command.messageId;

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
		} catch (error) {
			await this.messageService.addReaction(messageId, '❌', userNumber);

			throw error;
		}
	}
}
