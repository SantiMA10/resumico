import { ServerRoute } from '@hapi/hapi';

import { routes as postRoute } from './post';

export const routes = (): ServerRoute[] => {
	return [...postRoute()];
};
