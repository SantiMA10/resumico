import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { getAudioDurationInSeconds } from 'get-audio-duration';

import { Config } from '../../config';
import { SpeechToTextService } from './SpeechToTextService';

export class WhisperSpeechToTextService implements SpeechToTextService {
	public constructor(private config: Config) {}

	public async transcribe(filePath: string): Promise<{ text: string; duration: number }> {
		if (!existsSync(filePath)) {
			console.log('[WhisperSpeechToTextService] File does not exists');
			return { text: '', duration: 0 };
		}

		const { path } = this.config.files;
		execSync(`whisper ${filePath} --model tiny -o ${path}`); // , { stdio: 'inherit' }
		const text = (await readFile(`${filePath}.txt`)).toString();
		const duration = await getAudioDurationInSeconds(filePath);

		await Promise.all([
			unlink(filePath),
			unlink(`${filePath}.txt`),
			unlink(`${filePath}.vtt`),
			unlink(`${filePath}.srt`),
		]);

		return { text: text.replaceAll('\n', ''), duration };
	}
}
