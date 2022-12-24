import fetch from 'node-fetch';

import { Config } from '../../config';
import { TaskService } from './TaskService';

export class HttpTaskService implements TaskService {
	public constructor(private config: Config) {}

	public async createTask({ body }: { body: unknown }): Promise<void> {
		const { url } = this.config.tasks;

		fetch(url, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'text/plain' },
		});
	}
}
