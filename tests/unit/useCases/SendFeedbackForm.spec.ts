import { WhatsAppService } from '../../../src/services/message/WhatsAppService';
import { SendFeedbackForm } from '../../../src/useCases/sendFeedbackForm/SendFeedbackForm';

describe('SendFeedbackForm', () => {
	let messageService: WhatsAppService;
	let subject: SendFeedbackForm;

	beforeEach(() => {
		messageService = {
			downloadAudio: jest.fn(async () => ({ filePath: './file/path' })),
			addReaction: jest.fn(),
			sendMessage: jest.fn(),
		} as unknown as WhatsAppService;

		subject = new SendFeedbackForm(messageService);
	});

	it('sends a message with the feedback from link', async () => {
		await subject.process({ user: 'user', messageId: 'messageId' });

		expect(messageService.sendMessage).toHaveBeenCalledWith(
			'user',
			{ body: 'Aquí tienes el link para dar feedback: https://forms.gle/MnHm2U85EFkK9Zj27' },
			'messageId',
		);
	});

	it('adds the green check reaction if the message is sent', async () => {
		await subject.process({ user: 'user', messageId: 'messageId' });

		expect(messageService.addReaction).toHaveBeenCalledWith('messageId', '✅', 'user');
	});

	it('adds the red cross reaction if the message cannot be sent', async () => {
		jest.spyOn(messageService, 'sendMessage').mockRejectedValue('error');

		await subject.process({ user: 'user', messageId: 'messageId' }).catch(() => {
			// nothing to see
		});

		expect(messageService.addReaction).toHaveBeenCalledWith('messageId', '❌', 'user');
	});
});
