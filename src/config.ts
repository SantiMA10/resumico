import { z } from 'zod';

const config = z.object({
	whatsapp: z.object({
		verificationToken: z.string(),
		token: z.string(),
		sender: z.string(),
		apiVersion: z.string(),
	}),
	tasks: z.object({
		project: z.string(),
		queue: z.string(),
		location: z.string(),
		mode: z.string().regex(/appengine|http/),
		url: z.string(),
	}),
	files: z.object({
		path: z.string(),
		bucket: z.string(),
	}),
	openai: z.object({
		token: z.string(),
	}),
	speechToText: z.object({
		service: z.string().regex(/google|whisper/),
	}),
	summary: z.object({
		durationForSummary: z.number(),
	}),
});

const testConfig: Config = {
	whatsapp: {
		verificationToken: 'abc',
		token: 'token',
		sender: 'sender',
		apiVersion: 'apiVersion',
	},
	tasks: {
		project: 'project',
		queue: 'queue',
		location: 'location',
		mode: 'appengine',
		url: '/tasks',
	},
	files: {
		path: '/tmp',
		bucket: 'some-bucket',
	},
	openai: {
		token: 'token',
	},
	speechToText: {
		service: 'whisper',
	},
	summary: {
		durationForSummary: 60000,
	},
};

const envConfig = {
	whatsapp: {
		verificationToken: process.env.WHATSAPP_VERIFY_TOKEN,
		token: process.env.WHATSAPP_TOKEN,
		sender: process.env.WHATSAPP_SENDER,
		apiVersion: process.env.WHATSAPP_API_VERSION,
	},
	tasks: {
		project: process.env.GCLOUD_PROJECT,
		queue: process.env.GCLOUD_TASK_QUEUE,
		location: process.env.GCLOUD_LOCATION,
		mode: process.env.GCLOUD_TASK_MODE,
		url: process.env.GCLOUD_TASK_URL,
	},
	files: {
		path: process.env.FILE_DOWNLOAD_PATH,
		bucket: process.env.GCLOUD_BUCKET,
	},
	openai: {
		token: process.env.OPEN_AI_GPT3_TOKEN,
	},
	speechToText: {
		service: process.env.SPEECH_TO_TEXT_SERVICE,
	},
	summary: {
		durationForSummary: process.env.DURATION_FOR_SUMMARY || 60000,
	},
};

export type Config = z.infer<typeof config>;
export const getConfig = () =>
	config.parse(process.env.APP_ENV === 'test' ? testConfig : envConfig);
