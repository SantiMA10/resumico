export interface BaseWhatsAppMessage<Message> {
	entry: Entry<Message>[];
}

interface Entry<Message> {
	changes: Change<Message>[];
}

interface Change<Message> {
	value: Value<Message>;
}

interface Value<Message> {
	messages: Message[];
}
