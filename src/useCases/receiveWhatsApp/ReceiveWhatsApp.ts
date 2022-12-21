import { AudioWhatsAppMessage } from '../../entities/whatsAppMessages/AudioWhatsAppMessage';
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

		if (!this.isAudioMessage(message)) {
			if (messageId) {
				await this.messageService.addReaction(messageId, '❌', from);
			}
			return;
		}

		await Promise.all([
			this.messageService.addReaction(messageId, '⏳', from),
			this.taskService.createTask({ body: message }),
		]);
	}

	private isAudioMessage(message: WhatsAppMessage): message is AudioWhatsAppMessage {
		return message?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type === 'audio';
	}
}
