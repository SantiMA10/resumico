import { CloudTasksClient, protos } from '@google-cloud/tasks';

import { Config } from '../../config';
import { TaskService } from './TaskService';

interface TaskCommand {
	body: unknown;
	service: 'worker' | 'api';
}

export class GCTaskService implements TaskService {
	public constructor(private config: Config) {}

	public async createTask({ body, service }: TaskCommand): Promise<void> {
		const tasksClient = new CloudTasksClient();
		const { project, location } = this.config.tasks;
		const { queue, url, mode } = this.getTaskServiceConfiguration(service);

		const task = {
			parent: tasksClient.queuePath(project, location, queue),
			task: {
				...this.getTaskConfiguration(mode, url, body),
			},
		};

		await tasksClient.createTask(task as protos.google.cloud.tasks.v2.ICreateTaskRequest);
	}

	private getTaskServiceConfiguration(service: TaskCommand['service']) {
		if (service === 'api') {
			const { queue, url, mode, api } = this.config.tasks;
			return {
				mode: api?.mode || mode,
				url: api?.url || url,
				queue: api?.queue || queue,
			};
		}

		if (service === 'worker') {
			const { queue, url, mode, worker } = this.config.tasks;
			return {
				mode: worker?.mode || mode,
				url: worker?.url || url,
				queue: worker?.queue || queue,
			};
		}

		const { queue, url, mode } = this.config.tasks;
		return {
			mode: mode,
			url: url,
			queue: queue,
		};
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
