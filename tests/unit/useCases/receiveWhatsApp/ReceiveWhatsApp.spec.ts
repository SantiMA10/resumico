import { AudioWhatsAppMessage } from '../../../../src/entities/whatsAppMessages/AudioWhatsAppMessage';
import { TextWhatsAppMessage } from '../../../../src/entities/whatsAppMessages/TextWhatsAppMessage';
import { WhatsAppService } from '../../../../src/services/message/WhatsAppService';
import { TaskService } from '../../../../src/services/task/TaskService';
import { ReceiveWhatsApp } from '../../../../src/useCases/receiveWhatsApp/ReceiveWhatsApp';

describe('ReceiveWhatsApp', () => {
	let subject: ReceiveWhatsApp;
	let taskService: TaskService;
	let messageService: WhatsAppService;

	beforeEach(() => {
		taskService = {
			createTask: jest.fn(),
		};
		messageService = {
			downloadAudio: jest.fn(),
			markAsRead: jest.fn(),
			addReaction: jest.fn(),
			sendMessage: jest.fn(),
		} as unknown as WhatsAppService;

		subject = new ReceiveWhatsApp(taskService, messageService);
	});

	it('calls the task service with the whatsapp message', async () => {
		const command: AudioWhatsAppMessage = {
			entry: [
				{
					changes: [
						{ value: { messages: [{ id: 'abc', from: '', audio: { id: 'abc' }, type: 'audio' }] } },
					],
				},
			],
		};
		await subject.receive(command);

		expect(taskService.createTask).toHaveBeenCalledWith({ body: command });
	});

	it('mark the message as read', async () => {
		const command: AudioWhatsAppMessage = {
			entry: [
				{
					changes: [
						{ value: { messages: [{ id: 'abc', from: '', audio: { id: 'abc' }, type: 'audio' }] } },
					],
				},
			],
		};
		await subject.receive(command);

		expect(messageService.markAsRead).toHaveBeenCalledWith('abc');
	});

	it('ignores messages without audio id', async () => {
		const command: TextWhatsAppMessage = {
			entry: [
				{
					changes: [
						{ value: { messages: [{ id: 'abc', from: '', text: { body: 'abc' }, type: 'text' }] } },
					],
				},
			],
		};
		await subject.receive(command);

		expect(taskService.createTask).not.toHaveBeenCalledWith({ body: command });
	});

	it('reacts with a red cross to a non audio messages', async () => {
		const command: TextWhatsAppMessage = {
			entry: [
				{
					changes: [
						{
							value: { messages: [{ id: 'abc', from: 'me', text: { body: 'abc' }, type: 'text' }] },
						},
					],
				},
			],
		};
		await subject.receive(command);

		expect(messageService.addReaction).toHaveBeenCalledWith('abc', '❌', 'me');
	});

	it('reacts with a hourglass to a audio messages', async () => {
		const command: AudioWhatsAppMessage = {
			entry: [
				{
					changes: [
						{
							value: {
								messages: [{ id: 'abc', from: 'me', audio: { id: 'abc' }, type: 'audio' }],
							},
						},
					],
				},
			],
		};
		await subject.receive(command);

		expect(messageService.addReaction).toHaveBeenCalledWith('abc', '⏳', 'me');
	});
});
