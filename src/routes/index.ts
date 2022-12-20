import { ServerRoute } from '@hapi/hapi';

import { routes as audio2textRoutes } from './tasks/audio2text';
import { routes as whatsappRoutes } from './webhooks/whatsapp';

export const routes = (): ServerRoute[] => {
	return [...whatsappRoutes(), ...audio2textRoutes()];
};
