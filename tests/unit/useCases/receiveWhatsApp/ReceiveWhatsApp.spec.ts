import { WhatsAppService } from '../../../../src/services/message/WhatsAppService';
import { TaskService } from '../../../../src/services/task/TaskService';
import { ReceiveWhatsApp } from '../../../../src/useCases/receiveWhatsApp/ReceiveWhatsApp';
import { AudioMessageBuilder } from '../../../builders/AudioMessageBuilder';
import { ReplyMessageBuilder } from '../../../builders/ReplyMessageBuilder';
import { TextMessageBuilder } from '../../../builders/TextMessageBuilder';

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

	it('mark audio messages as read', async () => {
		const command = new AudioMessageBuilder().withMessageId('abc').build();
		await subject.receive(command);

		expect(messageService.markAsRead).toHaveBeenCalledWith('abc');
	});

	it('rejects the message if is not an audio or reply', async () => {
		const command = new TextMessageBuilder().build();
		await subject.receive(command);

		expect(taskService.createTask).not.toHaveBeenCalledWith({ body: command });
	});

	it('reacts with a red cross if the is not an audio or reply', async () => {
		const command = new TextMessageBuilder().withMessageId('abc').sentFrom('me').build();
		await subject.receive(command);

		expect(messageService.addReaction).toHaveBeenCalledWith('abc', '❌', 'me');
	});

	it('reacts with a hourglass to an audio messages', async () => {
		const command = new AudioMessageBuilder().withMessageId('abc').sentFrom('me').build();
		await subject.receive(command);

		expect(messageService.addReaction).toHaveBeenCalledWith('abc', '⏳', 'me');
	});

	it('reacts with a hourglass to a reply messages', async () => {
		const command = new ReplyMessageBuilder().withMessageId('abc').sentFrom('me').build();
		await subject.receive(command);

		expect(messageService.addReaction).toHaveBeenCalledWith('abc', '⏳', 'me');
	});

	it('creates an "ask-audio-options" task with the messageId, audioId and user from the audio message', async () => {
		const command = new AudioMessageBuilder()
			.withMessageId('messageId')
			.sentFrom('user')
			.withAudioId('audioId')
			.build();
		await subject.receive(command);

		expect(taskService.createTask).toHaveBeenCalledWith({
			body: { name: 'ask-audio-options', messageId: 'messageId', audioId: 'audioId', user: 'user' },
		});
	});

	it('creates an "transcription" task with the messageId, audioId and user from the transcription reply message', async () => {
		const command = new ReplyMessageBuilder()
			.withMessageId('messageId')
			.sentFrom('user')
			.askingForTranscription('audioId')
			.build();
		await subject.receive(command);

		expect(taskService.createTask).toHaveBeenCalledWith({
			body: { name: 'transcription', messageId: 'messageId', audioId: 'audioId', user: 'user' },
		});
	});

	it('creates an "summary" task with the messageId, audioId and user from the summary reply message', async () => {
		const command = new ReplyMessageBuilder()
			.withMessageId('messageId')
			.sentFrom('user')
			.askingForSummary('audioId')
			.build();
		await subject.receive(command);

		expect(taskService.createTask).toHaveBeenCalledWith({
			body: { name: 'summary', messageId: 'messageId', audioId: 'audioId', user: 'user' },
		});
	});

	it('creates an "transcription-and-summary" task with the messageId, audioId and user from the both reply message', async () => {
		const command = new ReplyMessageBuilder()
			.withMessageId('messageId')
			.sentFrom('user')
			.askingForAll('audioId')
			.build();
		await subject.receive(command);

		expect(taskService.createTask).toHaveBeenCalledWith({
			body: {
				name: 'transcription-and-summary',
				messageId: 'messageId',
				audioId: 'audioId',
				user: 'user',
			},
		});
	});
});
