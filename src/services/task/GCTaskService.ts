import { CloudTasksClient, protos } from '@google-cloud/tasks';

import { Config } from '../../config';
import { TaskService } from './TaskService';

export class GCTaskService implements TaskService {
	public constructor(private config: Config) {}

	public async createTask({ body }: { body: unknown }): Promise<void> {
		const tasksClient = new CloudTasksClient();
		const { project, location, queue, url, mode } = this.config.tasks;

		const task = {
			parent: tasksClient.queuePath(project, location, queue),
			task: {
				...this.getTaskConfiguration(mode, url, body),
			},
		};

		await tasksClient.createTask(task as protos.google.cloud.tasks.v2.ICreateTaskRequest);
	}

	private getTaskConfiguration(mode: string, url: string, body: unknown) {
		if (mode === 'appengine') {
			return {
				appEngineHttpRequest: {
					relativeUri: url,
					httpMethod: 'POST',
					body: Buffer.from(JSON.stringify(body)).toString('base64'),
					headers: {
						'Content-Type': 'text/plain',
					},
				},
			};
		}

		return {
			httpRequest: {
				headers: {
					'Content-Type': 'text/plain',
				},
				httpMethod: 'POST',
				url,
				body: Buffer.from(JSON.stringify(body)).toString('base64'),
			},
		};
	}
}
