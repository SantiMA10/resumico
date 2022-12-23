import { WhatsAppService } from '../../../../src/services/message/WhatsAppService';
import { AskAudioOptions } from '../../../../src/useCases/askAudioOptions/AskAudioOptions';

describe('AskAudioOptions', () => {
	let messageService: WhatsAppService;
	let subject: AskAudioOptions;

	beforeEach(() => {
		messageService = {
			sendMessageWithButtons: jest.fn(),
			addReaction: jest.fn(),
		} as unknown as WhatsAppService;

		subject = new AskAudioOptions(messageService);
	});

	it('sends a message with a button to get the transcription', async () => {
		await subject.ask({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(messageService.sendMessageWithButtons).toHaveBeenCalledWith(
			{
				text: '¿Qué quieres hacer con el audio?',
				buttons: expect.arrayContaining([{ id: 'transcription:audioId', text: 'Transcripción' }]),
				to: 'user',
			},
			'messageId',
		);
	});

	it('sends a message with a button to get the summary', async () => {
		await subject.ask({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(messageService.sendMessageWithButtons).toHaveBeenCalledWith(
			{
				text: '¿Qué quieres hacer con el audio?',
				buttons: expect.arrayContaining([{ id: 'summary:audioId', text: 'Resumen' }]),
				to: 'user',
			},
			'messageId',
		);
	});

	it('sends a message with a button to get the transcription and summary', async () => {
		await subject.ask({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(messageService.sendMessageWithButtons).toHaveBeenCalledWith(
			{
				text: '¿Qué quieres hacer con el audio?',
				buttons: expect.arrayContaining([{ id: 'all:audioId', text: 'Ambos' }]),
				to: 'user',
			},
			'messageId',
		);
	});

	it('reacts to the initial message with check if every goes well', async () => {
		await subject.ask({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(messageService.addReaction).toHaveBeenCalledWith('messageId', '✅', 'user');
	});

	it('reacts to the initial message with red cross if something fails', async () => {
		jest.spyOn(messageService, 'sendMessageWithButtons').mockRejectedValue(new Error());

		await subject.ask({ messageId: 'messageId', audioId: 'audioId', user: 'user' }).catch(() => {
			// nothing to do here
		});

		expect(messageService.addReaction).toHaveBeenCalledWith('messageId', '❌', 'user');
	});
});
