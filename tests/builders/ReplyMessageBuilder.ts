import { ReplyWhatsAppMessage } from '../../src/entities/whatsAppMessages/ReplyWhatsAppMessage';

export class ReplyMessageBuilder {
	private messageId?: string;
	private from?: string;
	private buttonReplayId?: string;

	public withMessageId(messageId: string) {
		this.messageId = messageId;

		return this;
	}

	public sentFrom(from: string) {
		this.from = from;

		return this;
	}

	public askingForTranscription(audioId: string) {
		this.buttonReplayId = `transcription:${audioId}`;

		return this;
	}

	public askingForSummary(audioId: string) {
		this.buttonReplayId = `summary:${audioId}`;

		return this;
	}

	public askingForAll(audioId: string) {
		this.buttonReplayId = `all:${audioId}`;

		return this;
	}

	public askingForConfiguration() {
		this.buttonReplayId = `configuration`;

		return this;
	}

	public askingForFeedbackForm() {
		this.buttonReplayId = `feedback`;

		return this;
	}

	public build(): ReplyWhatsAppMessage {
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
										interactive: {
											type: 'button_reply',
											button_reply: {
												id: this.buttonReplayId || 'buttonReplayId',
												title: 'buttonReplayTitle',
											},
										},
										type: 'interactive',
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
