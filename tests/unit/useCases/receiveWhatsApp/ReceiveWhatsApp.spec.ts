import { AudioWhatsAppMessage } from '../../../../src/entities/whatsAppMessages/AudioWhatsAppMessage';
import { TextWhatsAppMessage } from '../../../../src/entities/whatsAppMessages/TextWhatsAppMessage';
import { ReceiveWhatsApp } from '../../../../src/useCases/receiveWhatsApp/ReceiveWhatsApp';

describe('ReceiveWhatsApp', () => {
	it('calls the task service with the whatsapp message', async () => {
		const taskService = {
			createTask: jest.fn(),
		};
		const subject = new ReceiveWhatsApp(taskService);

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

	it('ignores messages without audio id', async () => {
		const taskService = {
			createTask: jest.fn(),
		};
		const subject = new ReceiveWhatsApp(taskService);

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
});
