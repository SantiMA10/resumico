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
		const filePath = path.join(fileBasePath, './input.ogg');
		await writeFile(filePath, await fileRequest.buffer());

		return { filePath };
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
		message: { body: string; header: string },
		reply?: string,
	): Promise<void> {
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
					to,
					...this.generateBody(message.header, message.body),
					...(reply && { context: { message_id: reply } }),
				}),
			},
		);

		if (!messageResponse.ok) {
			console.log(await messageResponse.text());
		}
	}

	private generateBody(header: string, text: string) {
		if (text.length > 1024) {
			return {
				type: 'text',
				text: {
					body: `*${header}* ${text}`,
				},
			};
		}

		return {
			type: 'interactive',
			interactive: {
				type: 'button',
				header: {
					type: 'text',
					text: header,
				},
				body: {
					text,
				},
				footer: {
					text: 'Powered by @SantiMA10',
				},
				action: {
					buttons: [
						{
							type: 'reply',
							reply: {
								id: 'unique-id-123',
								title: 'Muy buena',
							},
						},
						{
							type: 'reply',
							reply: {
								id: 'unique-id-456',
								title: 'Muy mejorable',
							},
						},
					],
				},
			},
		};
	}
}
