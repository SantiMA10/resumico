import { BaseWhatsAppMessage } from './BaseWhatsAppMessage';

export type AudioWhatsAppMessage = BaseWhatsAppMessage<Message>;

interface Message {
	from: string;
	id: string;
	type: 'audio';
	audio: {
		id: string;
	};
}
