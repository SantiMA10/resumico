import { AudioWhatsAppMessage } from '../../entities/whatsAppMessages/AudioWhatsAppMessage';
import { ReplyWhatsAppMessage } from '../../entities/whatsAppMessages/ReplyWhatsAppMessage';
import { WhatsAppMessage } from '../../entities/whatsAppMessages/WhatsAppMessage';
import { WhatsAppService } from '../../services/message/WhatsAppService';

interface TaskService {
	createTask: (command: { body: unknown }) => Promise<void>;
}

export class ReceiveWhatsApp {
	public constructor(private taskService: TaskService, private messageService: WhatsAppService) {}

	public async receive(message: WhatsAppMessage) {
		const messageId = message.entry?.[0]?.changes?.[0].value.messages?.[0]?.id;
		if (messageId) {
			await this.messageService.markAsRead(messageId);
		}

		const from = message.entry?.[0]?.changes?.[0].value.messages?.[0]?.from;

		if (!this.isAudioMessage(message) && !this.isReplyMessage(message)) {
			if (messageId) {
				await this.messageService.addReaction(messageId, '❌', from);
			}
			return;
		}

		await Promise.all([
			this.messageService.addReaction(messageId, '⏳', from),
			this.taskService.createTask({ body: this.createTaskBody(message) }),
		]);
	}

	private isAudioMessage(message: WhatsAppMessage): message is AudioWhatsAppMessage {
		return message?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type === 'audio';
	}

	private isReplyMessage(
		receivedMessage: WhatsAppMessage,
	): receivedMessage is ReplyWhatsAppMessage {
		const message = receivedMessage?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

		return message?.type === 'interactive' && message?.interactive?.type === 'button_reply';
	}

	private createTaskBody(received: ReplyWhatsAppMessage | AudioWhatsAppMessage) {
		const message = received?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

		if (message.type === 'audio') {
			return {
				name: 'ask-audio-options',
				messageId: message.id,
				audioId: message.audio.id,
				user: message.from,
			};
		}

		if (message.interactive.button_reply.id.includes('transcription')) {
			return {
				name: 'transcription',
				messageId: message.id,
				audioId: message.interactive.button_reply.id.split(':')[1],
				user: message.from,
			};
		}

		if (message.interactive.button_reply.id.includes('summary')) {
			return {
				name: 'summary',
				messageId: message.id,
				audioId: message.interactive.button_reply.id.split(':')[1],
				user: message.from,
			};
		}

		return {
			name: 'transcription-and-summary',
			messageId: message.id,
			audioId: message.interactive.button_reply.id.split(':')[1],
			user: message.from,
		};
	}
}
