import { WhatsAppService } from '../../../src/services/message/WhatsAppService';
import { SpeechToTextService } from '../../../src/services/speechToText/SpeechToTextService';
import { SendTranscription } from '../../../src/useCases/sendTranscription/SendTranscription';

describe('SendTranscription', () => {
	let messageService: WhatsAppService;
	let speechToTextService: SpeechToTextService;
	let subject: SendTranscription;

	beforeEach(() => {
		messageService = {
			downloadAudio: jest.fn(async () => ({ filePath: './file/path' })),
			addReaction: jest.fn(),
			sendMessage: jest.fn(),
		} as unknown as WhatsAppService;
		speechToTextService = {
			transcribe: jest.fn(async () => ({ text: 'hola', duration: 432432 })),
		};

		subject = new SendTranscription(messageService, speechToTextService);
	});

	it('downloads the given audio id using the message service', async () => {
		await subject.process({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(messageService.downloadAudio).toHaveBeenCalledWith('audioId');
	});

	it('calls the transcription service with the downloaded file path and audioId', async () => {
		jest.spyOn(messageService, 'downloadAudio').mockResolvedValue({ filePath: './file.ogg' });

		await subject.process({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(speechToTextService.transcribe).toHaveBeenCalledWith('./file.ogg', 'audioId');
	});

	it('reacts with a red cross if something goes wrong', async () => {
		jest.spyOn(messageService, 'downloadAudio').mockRejectedValue(new Error('boom!'));

		await subject
			.process({ messageId: 'messageId', audioId: 'audioId', user: 'user' })
			.catch(() => {
				// nothing to see here
			});

		expect(messageService.addReaction).toHaveBeenCalledWith('messageId', '❌', 'user');
	});

	it('reacts with a green check if the message has been transcribed', async () => {
		jest.spyOn(messageService, 'downloadAudio').mockResolvedValue({ filePath: './file.ogg' });
		jest
			.spyOn(speechToTextService, 'transcribe')
			.mockResolvedValue({ text: 'hola', duration: 123 });

		await subject.process({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(messageService.addReaction).toHaveBeenCalledWith('messageId', '✅', 'user');
	});

	it('sends the transcription to the user', async () => {
		jest.spyOn(messageService, 'downloadAudio').mockResolvedValue({ filePath: './file.ogg' });
		jest
			.spyOn(speechToTextService, 'transcribe')
			.mockResolvedValue({ text: 'hola', duration: 123 });

		await subject.process({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(messageService.sendMessage).toHaveBeenNthCalledWith(
			1,
			'user',
			{ header: 'Aquí tienes la transcripción:', body: 'hola' },
			'messageId',
		);
	});
});
