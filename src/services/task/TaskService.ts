export interface TaskService {
	createTask: (command: { body: unknown; service: 'worker' | 'api' }) => Promise<void>;
}
