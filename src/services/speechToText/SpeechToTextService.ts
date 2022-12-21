export interface SpeechToTextService {
	transcribe(filePath: string, audioId: string): Promise<{ text: string; duration: number }>;
}
