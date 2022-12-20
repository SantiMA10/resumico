import { BaseWhatsAppMessage } from './BaseWhatsAppMessage';

export type TextWhatsAppMessage = BaseWhatsAppMessage<Message>;

interface Message {
	from: string;
	id: string;
	type: 'text';
	text: {
		body: string;
	};
}
