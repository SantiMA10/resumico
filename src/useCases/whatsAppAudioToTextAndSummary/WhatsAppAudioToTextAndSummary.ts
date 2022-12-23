import { Config } from '../../config';
import { AudioWhatsAppMessage } from '../../entities/whatsAppMessages/AudioWhatsAppMessage';
import { WhatsAppService } from '../../services/message/WhatsAppService';
import { SpeechToTextService } from '../../services/speechToText/SpeechToTextService';
import { SummaryService } from '../../services/summary/SummaryService';

export class WhatsAppAudioToTextAndSummary {
	public constructor(
		private messageService: WhatsAppService,
		private speechToTextService: SpeechToTextService,
		private summarizeService: SummaryService,
		private config: Config,
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

		try {
			const { filePath } = await this.messageService.downloadAudio(audioId);
			const { duration, text } = await this.speechToTextService.transcribe(filePath, audioId);

			await this.messageService.sendMessage(
				userNumber,
				{
					header: 'Aquí tienes la transcripción:',
					body: text,
				},
				messageId,
			);
			await this.messageService.addReaction(messageId, '✅', userNumber);

			if (duration >= this.config.summary.durationForSummary) {
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
		} catch (error) {
			await this.messageService.addReaction(messageId, '❌', userNumber);
			await this.messageService.sendMessage(userNumber, { body: 'Algo ha salido mal' }, messageId);

			throw error;
		}
	}
}
