import { Config, getConfig } from '../../../src/config';
import { VerifyWhatsAppWebhook } from '../../../src/useCases/verifyWhatsAppWebhook/VerifyWhatsAppWebhook';

describe('VerifyWhatsAppWebhook', () => {
	let config: Config;
	let subject: VerifyWhatsAppWebhook;

	beforeEach(() => {
		config = getConfig();

		subject = new VerifyWhatsAppWebhook(config);
	});
	it('returns the challenge code if the verification works', async () => {
		const { challenge } = await subject.verify({
			mode: 'subscribe',
			token: config.whatsapp.verificationToken,
			challenge: '1234',
		});

		expect(challenge).toBe('1234');
	});

	it('throws an error if the mode is not subscribe', async () => {
		await expect(
			subject.verify({
				mode: 'suscribe',
				token: config.whatsapp.verificationToken,
				challenge: '1234',
			}),
		).rejects.toThrow(Error);
	});

	it('throws an error if token does not match the one in the config', async () => {
		await expect(
			subject.verify({
				mode: 'subscribe',
				token: 'patata',
				challenge: '1234',
			}),
		).rejects.toThrow(Error);
	});
});
