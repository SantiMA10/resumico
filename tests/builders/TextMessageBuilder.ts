import { TextWhatsAppMessage } from '../../src/entities/whatsAppMessages/TextWhatsAppMessage';

export class TextMessageBuilder {
	private messageId?: string;
	private from?: string;

	public withMessageId(messageId: string) {
		this.messageId = messageId;

		return this;
	}

	public sentFrom(from: string) {
		this.from = from;

		return this;
	}

	public build(): TextWhatsAppMessage {
		return {
			entry: [
				{
					changes: [
						{
							value: {
								messages: [
									{
										id: this.messageId || 'id',
										from: this.from || 'from',
										text: { body: 'body' },
										type: 'text',
									},
								],
							},
						},
					],
				},
			],
		};
	}
}
