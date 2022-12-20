import { Config } from '../../config';

interface Command {
	mode: string;
	token: string;
	challenge: string;
}

export class VerifyWhatsAppWebhook {
	public constructor(private config: Config) {}

	public async verify({ challenge, mode, token }: Command) {
		if (mode !== 'subscribe') {
			throw new Error('Invalid webhook mode');
		}

		if (token !== this.config.whatsapp.verificationToken) {
			throw new Error(`Invalid verification token: ${token}`);
		}

		return { challenge };
	}
}
