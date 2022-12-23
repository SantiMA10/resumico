import { AudioWhatsAppMessage } from '../../src/entities/whatsAppMessages/AudioWhatsAppMessage';

export class AudioMessageBuilder {
	private messageId?: string;
	private from?: string;
	private audioId?: string;

	public withMessageId(messageId: string) {
		this.messageId = messageId;

		return this;
	}

	public sentFrom(from: string) {
		this.from = from;

		return this;
	}

	public withAudioId(audioId: string) {
		this.audioId = audioId;

		return this;
	}

	public build(): AudioWhatsAppMessage {
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
										audio: { id: this.audioId || 'audioId' },
										type: 'audio',
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
