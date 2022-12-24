import * as speech from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import ffmpeg from 'fluent-ffmpeg';
import { readFile, unlink } from 'fs/promises';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import getMP3Duration from 'get-mp3-duration';
import path from 'path';

import { Config } from '../../config';
import { SpeechToTextService } from './SpeechToTextService';

export class GCSpeechToTextService implements SpeechToTextService {
	public constructor(private config: Config) {}

	public async transcribe(
		filePath: string,
		audioId: string,
	): Promise<{ text: string; duration: number }> {
		const mp3FilePath = await this.audioToMp3(filePath, audioId);
		const duration = await this.audioDuration(mp3FilePath);
		const bucketUri = await this.uploadFileFromBucket(mp3FilePath, audioId);
		const text = await this.transcribeAudioFile(bucketUri);

		await Promise.all([unlink(filePath), unlink(mp3FilePath), this.removeFileFromBucket(audioId)]);
		return { text, duration };
	}

	private async transcribeAudioFile(bucketUri: string): Promise<string> {
		const client = new speech.SpeechClient();

		const request: speech.protos.google.cloud.speech.v1.IRecognizeRequest = {
			audio: {
				uri: bucketUri,
			},
			config: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				encoding: 'MP3' as any,
				languageCode: 'es-ES',
				sampleRateHertz: 48000,
				audioChannelCount: 1,
			},
		};

		const [operation] = await client.longRunningRecognize(request);
		const [response] = await operation.promise();
		if (!response || !response.results) {
			return '';
		}

		return response.results.map((result) => result?.alternatives?.[0].transcript).join('. ');
	}

	private async uploadFileFromBucket(filePath: string, audioId: string): Promise<string> {
		const { bucket } = this.config.files;
		const fileName = `${audioId}.mp3`;

		const storage = new Storage();
		await storage.bucket(bucket).upload(filePath, { destination: fileName });

		return `gs://${bucket}/${fileName}`;
	}

	private async removeFileFromBucket(audioId: string): Promise<void> {
		const { bucket } = this.config.files;
		const fileName = `${audioId}.mp3`;

		const storage = new Storage();
		await storage.bucket(bucket).file(fileName).delete();
	}

	private async audioDuration(filePath: string): Promise<number> {
		return getMP3Duration(await readFile(filePath));
	}

	private async audioToMp3(inputFilePath: string, audioId: string): Promise<string> {
		const { path: fileBasePath } = this.config.files;
		const outputFilePath = path.join(fileBasePath, `./${audioId}.mp3`);

		return await new Promise((resolve) => {
			const ffmpegCommand = ffmpeg(inputFilePath)
				.audioCodec('libmp3lame')
				.output(outputFilePath)
				.on('end', () => resolve(outputFilePath));
			ffmpegCommand.run();
		});
	}
}
