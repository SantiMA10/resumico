export interface SpeechToTextService {
	transcribe(filePath: string): Promise<{ text: string; duration: number }>;
}
