import { initServer } from './server';

initServer().then(async (server) => {
	await server.start();

	console.log(`Server running at: ${server.info.uri}`);
});
