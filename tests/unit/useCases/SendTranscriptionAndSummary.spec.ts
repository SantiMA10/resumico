import { WhatsAppService } from '../../../src/services/message/WhatsAppService';
import { SpeechToTextService } from '../../../src/services/speechToText/SpeechToTextService';
import { SummaryService } from '../../../src/services/summary/SummaryService';
import { SendTranscriptionAndSummary } from '../../../src/useCases/sendTranscriptionAndSummary/SendTranscriptionAndSummary';

describe('SendTranscriptionAndSummary', () => {
	let messageService: WhatsAppService;
	let speechToTextService: SpeechToTextService;
	let summaryService: SummaryService;
	let subject: SendTranscriptionAndSummary;

	beforeEach(() => {
		messageService = {
			downloadAudio: jest.fn(async () => ({ filePath: './file/path' })),
			addReaction: jest.fn(),
			sendMessage: jest.fn(),
		} as unknown as WhatsAppService;
		speechToTextService = {
			transcribe: jest.fn(async () => ({ text: 'hola', duration: 432432 })),
		};
		summaryService = {
			summarize: jest.fn(async () => 'summary'),
		};

		subject = new SendTranscriptionAndSummary(messageService, speechToTextService, summaryService);
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

	it('calls the summary service with the transcription', async () => {
		jest.spyOn(messageService, 'downloadAudio').mockResolvedValue({ filePath: './file.ogg' });
		jest
			.spyOn(speechToTextService, 'transcribe')
			.mockResolvedValue({ text: 'hola', duration: 123 });

		await subject.process({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(summaryService.summarize).toHaveBeenCalledWith('hola');
	});

	it('sends the summary to the user', async () => {
		jest.spyOn(messageService, 'downloadAudio').mockResolvedValue({ filePath: './file.ogg' });
		jest
			.spyOn(speechToTextService, 'transcribe')
			.mockResolvedValue({ text: 'hola', duration: 123 });
		jest.spyOn(summaryService, 'summarize').mockResolvedValue('Summary');

		await subject.process({ messageId: 'messageId', audioId: 'audioId', user: 'user' });

		expect(messageService.sendMessage).toHaveBeenNthCalledWith(
			2,
			'user',
			{ header: 'Aquí tienes un resumen:', body: 'Summary' },
			'messageId',
		);
	});
});
