import { CloudTasksClient, protos } from '@google-cloud/tasks';

import { Config } from '../../config';
import { TaskService } from './TaskService';

export class GCTaskService implements TaskService {
	public constructor(private config: Config) {}

	public async createTask({ body }: { body: unknown }): Promise<void> {
		const tasksClient = new CloudTasksClient();
		const { project, location, queue, path } = this.config.tasks;

		const task: protos.google.cloud.tasks.v2.ICreateTaskRequest = {
			parent: tasksClient.queuePath(project, location, queue),
			task: {
				appEngineHttpRequest: {
					relativeUri: path,
					httpMethod: 'POST',
					body: Buffer.from(JSON.stringify(body)).toString('base64'),
					headers: {
						'Content-Type': 'text/plain',
					},
				},
			},
		};

		await tasksClient.createTask(task);
	}
}
