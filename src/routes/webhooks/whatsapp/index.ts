import { ServerRoute } from '@hapi/hapi';

import { routes as getRoute } from './get';
import { routes as postRoute } from './post';

export const routes = (): ServerRoute[] => {
	return [...getRoute(), ...postRoute()];
};
