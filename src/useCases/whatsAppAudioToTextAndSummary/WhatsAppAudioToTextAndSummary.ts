import { AudioWhatsAppMessage } from '../../entities/whatsAppMessages/AudioWhatsAppMessage';
import { WhatsAppService } from '../../services/message/WhatsAppService';
import { SpeechToTextService } from '../../services/speechToText/SpeechToTextService';
import { SummaryService } from '../../services/summary/SummaryService';

export class WhatsAppAudioToTextAndSummary {
	public constructor(
		private messageService: WhatsAppService,
		private speechToTextService: SpeechToTextService,
		private summarizeService: SummaryService,
	) {}

	public async process(audio: AudioWhatsAppMessage) {
		const message = audio.entry?.[0]?.changes?.[0].value.messages?.[0];
		if (!message) {
			console.log('skipping invalid message', JSON.stringify(message));
			return;
		}

		const audioId = message.audio.id;
		const userNumber = message.from;
		const messageId = message.id;

		const { filePath } = await this.messageService.downloadAudio(audioId);
		const { duration, text } = await this.speechToTextService.transcribe(filePath);

		await this.messageService.sendMessage(
			userNumber,
			{
				header: 'Aquí tienes la transcripción:',
				body: text,
			},
			messageId,
		);

		if (duration > 60000) {
			const summary = await this.summarizeService.summarize(text);
			if (!summary) {
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
		}
	}
}
