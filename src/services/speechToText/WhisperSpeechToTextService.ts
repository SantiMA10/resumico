import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { getAudioDurationInSeconds } from 'get-audio-duration';

import { Config } from '../../config';
import { CounterMetrics, HistogramMetrics } from '../../entities/Metrics';
import { MetricsService } from '../telemetry/MetricsService';
import { SpeechToTextService } from './SpeechToTextService';

export class WhisperSpeechToTextService implements SpeechToTextService {
	public constructor(private config: Config, private metricsService?: MetricsService) {}

	public async transcribe(filePath: string): Promise<{ text: string; duration: number }> {
		await this.metricsService?.incrementCounter(CounterMetrics.WHISPER_TRANSCRIPTION_STARTED);
		if (!existsSync(filePath)) {
			await this.metricsService?.incrementCounter(CounterMetrics.WHISPER_TRANSCRIPTION_FAILED);
			console.log('[WhisperSpeechToTextService] File does not exists');
			return { text: '', duration: 0 };
		}

		try {
			const { path } = this.config.files;
			const startTime = new Date().getTime();
			execSync(`whisper ${filePath} --model base -o ${path}`); // , { stdio: 'inherit' }
			const endTime = new Date().getTime();
			await this.metricsService?.recordHistogram(
				HistogramMetrics.WHISPER_TRANSCRIPTION_TIME,
				endTime - startTime,
			);
			const text = (await readFile(`${filePath}.txt`)).toString();
			const duration = (await getAudioDurationInSeconds(filePath)) * 1000;
			await this.metricsService?.recordHistogram(HistogramMetrics.WHISPER_AUDIO_DURATION, duration);

			await this.removeAllFiles(filePath);

			await this.metricsService?.incrementCounter(CounterMetrics.WHISPER_TRANSCRIPTION_COMPLETED);
			return { text: text.replaceAll('\n', ' '), duration };
		} catch (error) {
			await this.metricsService?.incrementCounter(CounterMetrics.WHISPER_TRANSCRIPTION_FAILED);
			await this.removeAllFiles(filePath);

			throw error;
		}
	}

	private async removeAllFiles(filePath: string) {
		await Promise.all([
			unlink(filePath),
			unlink(`${filePath}.txt`),
			unlink(`${filePath}.vtt`),
			unlink(`${filePath}.srt`),
		]);
	}
}
