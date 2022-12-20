export interface TaskService {
	createTask: (command: { body: unknown }) => Promise<void>;
}
