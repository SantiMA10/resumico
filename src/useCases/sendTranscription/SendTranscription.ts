import { WhatsAppService } from '../../services/message/WhatsAppService';
import { SpeechToTextService } from '../../services/speechToText/SpeechToTextService';

interface Command {
	messageId: string;
	user: string;
	audioId: string;
}

export class SendTranscription {
	public constructor(
		private messageService: WhatsAppService,
		private speechToTextService: SpeechToTextService,
	) {}

	public async process(command: Command) {
		const audioId = command.audioId;
		const userNumber = command.user;
		const messageId = command.messageId;

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
		} catch (error) {
			await this.messageService.addReaction(messageId, '❌', userNumber);

			throw error;
		}
	}
}
