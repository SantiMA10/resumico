import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { StatusCodes } from 'http-status-codes';

import { getConfig } from '../../config';
import { AudioWhatsAppMessage } from '../../entities/whatsAppMessages/AudioWhatsAppMessage';
import { WhatsAppService } from '../../services/message/WhatsAppService';
import { GCSpeechToTextService } from '../../services/speechToText/GCSpeechToTextService';
import { WhisperSpeechToTextService } from '../../services/speechToText/WhisperSpeechToTextService';
import { GPT3SummaryService } from '../../services/summary/GPT3SummaryService';
import { AskAudioOptions } from '../../useCases/askAudioOptions/AskAudioOptions';
import { WhatsAppAudioToTextAndSummary } from '../../useCases/whatsAppAudioToTextAndSummary/WhatsAppAudioToTextAndSummary';

export const routes = (): ServerRoute[] => {
	return [
		{
			method: 'POST',
			path: '/tasks',
			handler: async (req: Request, h: ResponseToolkit) => {
				try {
					const config = getConfig();

					const messageService = new WhatsAppService(config);
					const speechToText =
						config.speechToText.service === 'google'
							? new GCSpeechToTextService(config)
							: new WhisperSpeechToTextService(config);
					const summary = new GPT3SummaryService(config);

					const payload = JSON.parse(req.payload as string);

					if ('name' in payload && payload.name === 'ask-audio-options') {
						const askAudioOptions = new AskAudioOptions(messageService);
						askAudioOptions.ask({
							messageId: payload.messageId,
							audioId: payload.audioId,
							user: payload.user,
						});

						return h.response().code(StatusCodes.NO_CONTENT);
					}

					if ('name' in payload) {
						console.log(payload);

						return h.response().code(StatusCodes.NO_CONTENT);
					}

					const audio2textAndSummary = new WhatsAppAudioToTextAndSummary(
						messageService,
						speechToText,
						summary,
						config,
					);
					await audio2textAndSummary.process(payload as AudioWhatsAppMessage);
				} catch (error) {
					console.error(error);
				}

				return h.response().code(StatusCodes.NO_CONTENT);
			},
		},
	];
};
