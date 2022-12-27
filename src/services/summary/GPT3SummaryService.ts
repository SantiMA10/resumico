import fetch from 'node-fetch';

import { Config } from '../../config';
import { SummaryService } from './SummaryService';

export class GPT3SummaryService implements SummaryService {
	public constructor(private config: Config) {}

	public async summarize(message: string): Promise<string> {
		const { token } = this.config.openai;

		const summaryResponse = await fetch('https://api.openai.com/v1/completions', {
			method: 'POST',
			headers: {
				'authorization': `Bearer ${token}`,
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				model: 'text-davinci-003',
				prompt: `${message}\n\nTL;DR;\n\n`,
				temperature: 0.3,
				max_tokens: 120,
				top_p: 1.0,
				frequency_penalty: 0.0,
				presence_penalty: 0.0,
			}),
		});

		if (!summaryResponse.ok) {
			console.log(await summaryResponse.text());
			return '';
		}

		const json = await summaryResponse.json();

		return json.choices
			.map((choice: { text: string }) => choice.text.replaceAll('\n', ''))
			.join('. ');
	}
}
