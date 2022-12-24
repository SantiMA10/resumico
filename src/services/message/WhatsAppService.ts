import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';

import { Config } from '../../config';

export class WhatsAppService {
	public constructor(private config: Config) {}

	public async downloadAudio(audioId: string): Promise<{ filePath: string }> {
		const { apiVersion, token } = this.config.whatsapp;
		const { path: fileBasePath } = this.config.files;

		const config = { headers: { authorization: `Bearer ${token}` } };
		const audioRequest = await fetch(`https://graph.facebook.com/${apiVersion}/${audioId}`, config);
		const { url } = await audioRequest.json();
		const fileRequest = await fetch(url, config);
		const filePath = path.join(fileBasePath, `./${audioId}.ogg`);
		await writeFile(filePath, await fileRequest.buffer());

		return { filePath };
	}

	public async sendMessageWithButtons(
		options: { text: string; to: string; buttons: Array<{ id: string; text: string }> },
		reply?: string,
	) {
		const { apiVersion, sender, token } = this.config.whatsapp;

		const messageResponse = await fetch(
			`https://graph.facebook.com/${apiVersion}/${sender}/messages`,
			{
				method: 'POST',
				headers: {
					'authorization': `Bearer ${token}`,
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					status: 'read',
					to: options.to,
					type: 'interactive',
					interactive: {
						type: 'button',
						body: {
							text: options.text,
						},
						footer: {
							text: 'Hecho con ❤️ por @SantiMA10',
						},
						action: {
							buttons: options.buttons.map((button) => ({
								type: 'reply',
								reply: {
									id: button.id,
									title: button.text,
								},
							})),
						},
					},
					...(reply && { context: { message_id: reply } }),
				}),
			},
		);

		if (!messageResponse.ok) {
			console.log(await messageResponse.text());
		}
	}

	public async markAsRead(messageId: string): Promise<void> {
		const { apiVersion, sender, token } = this.config.whatsapp;

		const messageResponse = await fetch(
			`https://graph.facebook.com/${apiVersion}/${sender}/messages`,
			{
				method: 'POST',
				headers: {
					'authorization': `Bearer ${token}`,
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					status: 'read',
					message_id: messageId,
				}),
			},
		);

		if (!messageResponse.ok) {
			console.log(await messageResponse.text());
		}
	}

	public async addReaction(messageId: string, emoji: string, to: string): Promise<void> {
		const { apiVersion, sender, token } = this.config.whatsapp;

		const messageResponse = await fetch(
			`https://graph.facebook.com/${apiVersion}/${sender}/messages`,
			{
				method: 'POST',
				headers: {
					'authorization': `Bearer ${token}`,
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					type: 'reaction',
					to,
					reaction: {
						message_id: messageId,
						emoji,
					},
				}),
			},
		);

		if (!messageResponse.ok) {
			console.log(await messageResponse.text());
		}
	}

	public async sendMessage(
		to: string,
		message: { body: string; header?: string },
		reply?: string,
	): Promise<void> {
		const { apiVersion, sender, token } = this.config.whatsapp;

		const bodies = message.body.match(/.{1,1000}/g);
		let previousMessageId = reply;

		if (!bodies) {
			return;
		}

		for (const body of bodies) {
			const messageResponse = await fetch(
				`https://graph.facebook.com/${apiVersion}/${sender}/messages`,
				{
					method: 'POST',
					headers: {
						'authorization': `Bearer ${token}`,
						'content-type': 'application/json',
					},
					body: JSON.stringify({
						messaging_product: 'whatsapp',
						to,
						...this.generateBody(body, message.header),
						...(reply && { context: { message_id: previousMessageId } }),
					}),
				},
			);

			if (!messageResponse.ok) {
				console.log(await messageResponse.text());
			}

			previousMessageId = (await messageResponse.json())?.messages?.[0]?.id;
		}
	}

	private generateBody(text: string, header: string | undefined) {
		return {
			type: 'interactive',
			interactive: {
				type: 'button',
				...(header && {
					header: {
						type: 'text',
						text: header,
					},
				}),
				body: {
					text,
				},
				footer: {
					text: 'Hecho con ❤️ por @SantiMA10',
				},
				action: {
					buttons: [
						{
							type: 'reply',
							reply: {
								id: 'configuration',
								title: 'Configuración',
							},
						},
					],
				},
			},
		};
	}
}
