import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { StatusCodes } from 'http-status-codes';

import { getConfig } from '../../../config';
import { WhatsAppMessage } from '../../../entities/whatsAppMessages/WhatsAppMessage';
import { WhatsAppService } from '../../../services/message/WhatsAppService';
import { GCTaskService } from '../../../services/task/GCTaskService';
import { HttpTaskService } from '../../../services/task/HttpTaskService';
import { ReceiveWhatsApp } from '../../../useCases/receiveWhatsApp/ReceiveWhatsApp';

export const routes = (): ServerRoute[] => {
	return [
		{
			method: 'POST',
			path: '/webhooks/whatsapp',
			handler: async (req: Request, h: ResponseToolkit) => {
				try {
					const config = getConfig();

					const taskService =
						config.tasks.service === 'google'
							? new GCTaskService(config)
							: new HttpTaskService(config);

					const receiveWhatsApp = new ReceiveWhatsApp(taskService, new WhatsAppService(config));
					await receiveWhatsApp.receive(req.payload as WhatsAppMessage);
				} catch (error) {
					console.error(error);
				}

				return h.response().code(StatusCodes.NO_CONTENT);
			},
		},
	];
};
