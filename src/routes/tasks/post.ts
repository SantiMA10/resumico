import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { StatusCodes } from 'http-status-codes';

import { getConfig } from '../../config';
import { WhatsAppService } from '../../services/message/WhatsAppService';
import { GCSpeechToTextService } from '../../services/speechToText/GCSpeechToTextService';
import { WhisperSpeechToTextService } from '../../services/speechToText/WhisperSpeechToTextService';
import { GPT3SummaryService } from '../../services/summary/GPT3SummaryService';
import { OpenTelemetryMetricsService } from '../../services/telemetry/OpenTelemetryMetricsService';
import { AskAudioOptions } from '../../useCases/askAudioOptions/AskAudioOptions';
import { SendSummary } from '../../useCases/sendSummary/SendSummary';
import { SendTranscription } from '../../useCases/sendTranscription/SendTranscription';
import { SendTranscriptionAndSummary } from '../../useCases/sendTranscriptionAndSummary/SendTranscriptionAndSummary';

export const routes = (): ServerRoute[] => {
	return [
		{
			method: 'POST',
			path: '/tasks',
			handler: async (req: Request, h: ResponseToolkit) => {
				try {
					const config = getConfig();

					const metricsService = new OpenTelemetryMetricsService();
					const messageService = new WhatsAppService(config);
					const speechToText =
						config.speechToText.service === 'google'
							? new GCSpeechToTextService(config)
							: new WhisperSpeechToTextService(config, metricsService);
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

					if ('name' in payload && payload.name === 'transcription-and-summary') {
						const sendTranscriptionAndSummary = new SendTranscriptionAndSummary(
							messageService,
							speechToText,
							summary,
							metricsService,
						);
						await sendTranscriptionAndSummary.process({
							messageId: payload.messageId,
							audioId: payload.audioId,
							user: payload.user,
						});

						return h.response().code(StatusCodes.NO_CONTENT);
					}

					if ('name' in payload && payload.name === 'transcription') {
						const sendTranscription = new SendTranscription(
							messageService,
							speechToText,
							metricsService,
						);
						await sendTranscription.process({
							messageId: payload.messageId,
							audioId: payload.audioId,
							user: payload.user,
						});

						return h.response().code(StatusCodes.NO_CONTENT);
					}

					if ('name' in payload && payload.name === 'summary') {
						const sendSummary = new SendSummary(
							messageService,
							speechToText,
							summary,
							metricsService,
						);
						await sendSummary.process({
							messageId: payload.messageId,
							audioId: payload.audioId,
							user: payload.user,
						});

						return h.response().code(StatusCodes.NO_CONTENT);
					}
				} catch (error) {
					console.error(error);
				}

				return h.response().code(StatusCodes.NO_CONTENT);
			},
		},
	];
};
