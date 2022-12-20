import { AudioWhatsAppMessage } from '../../entities/whatsAppMessages/AudioWhatsAppMessage';
import { WhatsAppMessage } from '../../entities/whatsAppMessages/WhatsAppMessage';

interface TaskService {
	createTask: (command: { body: unknown }) => Promise<void>;
}

export class ReceiveWhatsApp {
	public constructor(private taskService: TaskService) {}

	public async receive(message: WhatsAppMessage) {
		if (!this.isAudioMessage(message)) {
			return;
		}

		await this.taskService.createTask({ body: message });
	}

	private isAudioMessage(message: WhatsAppMessage): message is AudioWhatsAppMessage {
		return message?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type === 'audio';
	}
}
