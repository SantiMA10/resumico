import { ServerRoute } from '@hapi/hapi';

import { routes as taskRoutes } from './tasks';
import { routes as whatsappRoutes } from './webhooks/whatsapp';

export const routes = (): ServerRoute[] => {
	return [...whatsappRoutes(), ...taskRoutes()];
};
