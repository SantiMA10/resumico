import { AudioWhatsAppMessage } from './AudioWhatsAppMessage';
import { TextWhatsAppMessage } from './TextWhatsAppMessage';

export type WhatsAppMessage = AudioWhatsAppMessage | TextWhatsAppMessage;
