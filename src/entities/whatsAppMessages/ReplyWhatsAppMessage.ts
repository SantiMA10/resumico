import { BaseWhatsAppMessage } from './BaseWhatsAppMessage';

export type ReplyWhatsAppMessage = BaseWhatsAppMessage<Message>;

interface Message {
	from: string;
	id: string;
	type: 'interactive';
	interactive: {
		type: 'button_reply';
		button_reply: {
			id: string;
			title: string;
		};
	};
}
