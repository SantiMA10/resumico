import * as opentelemetry from '@opentelemetry/api';

import { WhatsAppService } from '../../services/message/WhatsAppService';

interface Command {
	messageId: string;
	audioId: string;
	user: string;
}

export class AskAudioOptions {
	public constructor(private messageService: WhatsAppService) {}

	public async ask(command: Command) {
		const meter = opentelemetry.metrics.getMeter('resumico');
		try {
			meter?.createCounter('ASK_AUDIO_OPTIONS').add(1);
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
			meter?.createCounter('ASK_AUDIO_OPTIONS_COMPLETED').add(1);
		} catch (error) {
			meter?.createCounter('ASK_AUDIO_OPTIONS_FAILED').add(1);
			await this.messageService.addReaction(command.messageId, '❌', command.user);

			throw error;
		}
	}
}
