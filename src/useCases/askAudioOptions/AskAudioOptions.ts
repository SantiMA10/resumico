import { WhatsAppService } from '../../services/message/WhatsAppService';

interface Command {
	messageId: string;
	audioId: string;
	user: string;
}

export class AskAudioOptions {
	public constructor(private messageService: WhatsAppService) {}

	public async ask(command: Command) {
		try {
			await this.messageService.sendMessageWithButtons(
				{
					text: '¿Qué quieres hacer con el audio?',
					buttons: [
						{ id: `transcription:${command.audioId}`, text: 'Transcripción' },
						{ id: `summary:${command.audioId}`, text: 'Resumen' },
						{ id: `all:${command.audioId}`, text: 'Ambos' },
					],
					to: command.user,
				},
				command.messageId,
			);
			await this.messageService.addReaction(command.messageId, '✅', command.user);
		} catch (error) {
			await this.messageService.addReaction(command.messageId, '❌', command.user);

			throw error;
		}
	}
}
