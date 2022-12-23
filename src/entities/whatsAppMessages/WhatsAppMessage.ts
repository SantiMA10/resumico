import { AudioWhatsAppMessage } from './AudioWhatsAppMessage';
import { ReplyWhatsAppMessage } from './ReplyWhatsAppMessage';
import { TextWhatsAppMessage } from './TextWhatsAppMessage';

export type WhatsAppMessage = AudioWhatsAppMessage | TextWhatsAppMessage | ReplyWhatsAppMessage;
