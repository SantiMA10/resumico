import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { StatusCodes } from 'http-status-codes';

import { getConfig } from '../../../config';
import { AudioWhatsAppMessage } from '../../../entities/whatsAppMessages/AudioWhatsAppMessage';
import { WhatsAppService } from '../../../services/message/WhatsAppService';
import { GCSpeechToTextService } from '../../../services/speechToText/GCSpeechToTextService';
import { GPT3SummaryService } from '../../../services/summary/GPT3SummaryService';
import { WhatsAppAudioToTextAndSummary } from '../../../useCases/whatsAppAudioToTextAndSummary/WhatsAppAudioToTextAndSummary';

export const routes = (): ServerRoute[] => {
	return [
		{
			method: 'POST',
			path: '/tasks/audio2text',
			handler: async (req: Request, h: ResponseToolkit) => {
				try {
					const config = getConfig();
					const messageService = new WhatsAppService(config);
					const speechToText = new GCSpeechToTextService(config);
					const summary = new GPT3SummaryService(config);
					const audio2textAndSummary = new WhatsAppAudioToTextAndSummary(
						messageService,
						speechToText,
						summary,
					);
					await audio2textAndSummary.process(
						JSON.parse(req.payload as string) as AudioWhatsAppMessage,
					);
				} catch (error) {
					console.error(error);
				}

				return h.response().code(StatusCodes.NO_CONTENT);
			},
		},
	];
};
