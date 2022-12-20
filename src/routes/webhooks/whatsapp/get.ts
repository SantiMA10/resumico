import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { StatusCodes } from 'http-status-codes';

import { getConfig } from '../../../config';
import { VerifyWhatsAppWebhook } from '../../../useCases/verifyWhatsAppWebhook/VerifyWhatsAppWebhook';

export const routes = (): ServerRoute[] => {
	return [
		{
			method: 'GET',
			path: '/webhooks/whatsapp',
			handler: async (req: Request, h: ResponseToolkit) => {
				try {
					const config = getConfig();
					const verifyWebhook = new VerifyWhatsAppWebhook(config);

					const { challenge } = await verifyWebhook.verify({
						mode: req.query['hub.mode'],
						token: req.query['hub.verify_token'],
						challenge: req.query['hub.challenge'],
					});
					return h.response(challenge).code(StatusCodes.OK);
				} catch (error) {
					console.error(error);
				}

				return h.response().code(StatusCodes.FORBIDDEN);
			},
		},
	];
};
