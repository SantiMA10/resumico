export interface TaskCommand {
	body: unknown;
	service: 'worker' | 'api';
}

export interface TaskService {
	createTask: (command: TaskCommand) => Promise<void>;
}
