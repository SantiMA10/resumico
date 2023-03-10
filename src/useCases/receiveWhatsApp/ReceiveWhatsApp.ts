import { AudioWhatsAppMessage } from '../../entities/whatsAppMessages/AudioWhatsAppMessage';
import { ReplyWhatsAppMessage } from '../../entities/whatsAppMessages/ReplyWhatsAppMessage';
import { WhatsAppMessage } from '../../entities/whatsAppMessages/WhatsAppMessage';
import { WhatsAppService } from '../../services/message/WhatsAppService';
import { TaskCommand, TaskService } from '../../services/task/TaskService';

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
			this.taskService.createTask(this.createTaskCommand(message)),
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

	private createTaskCommand(received: ReplyWhatsAppMessage | AudioWhatsAppMessage): TaskCommand {
		const message = received?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

		if (message.type === 'audio') {
			return {
				body: {
					name: 'ask-audio-options',
					messageId: message.id,
					audioId: message.audio.id,
					user: message.from,
				},
				service: 'api',
			};
		}

		if (message.interactive.button_reply.id.includes('transcription')) {
			return {
				body: {
					name: 'transcription',
					messageId: message.id,
					audioId: message.interactive.button_reply.id.split(':')[1],
					user: message.from,
				},
				service: 'worker',
			};
		}

		if (message.interactive.button_reply.id.includes('summary')) {
			return {
				body: {
					name: 'summary',
					messageId: message.id,
					audioId: message.interactive.button_reply.id.split(':')[1],
					user: message.from,
				},
				service: 'worker',
			};
		}

		if (message.interactive.button_reply.id.includes('configuration')) {
			return {
				body: {
					name: 'configuration',
					messageId: message.id,
					user: message.from,
				},
				service: 'api',
			};
		}

		if (message.interactive.button_reply.id.includes('all')) {
			return {
				body: {
					name: 'transcription-and-summary',
					messageId: message.id,
					audioId: message.interactive.button_reply.id.split(':')[1],
					user: message.from,
				},
				service: 'worker',
			};
		}

		return {
			body: {
				name: 'feedback',
				messageId: message.id,
				user: message.from,
			},
			service: 'api',
		};
	}
}
