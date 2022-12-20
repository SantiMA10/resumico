import { Server } from '@hapi/hapi';

import { routes } from './routes';

export const initServer = async (): Promise<Server> => {
	const server = new Server({ port: process.env.PORT || 3000 });

	server.route(routes());

	return server;
};
