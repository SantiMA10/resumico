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
		service: z.string().regex(/google|http/),
		api: z
			.object({
				queue: z.string(),
				mode: z.string().regex(/appengine|http/),
				url: z.string(),
				service: z.string().regex(/google|http/),
			})
			.optional(),
		worker: z
			.object({
				queue: z.string(),
				mode: z.string().regex(/appengine|http/),
				url: z.string(),
				service: z.string().regex(/google|http/),
			})
			.optional(),
	}),
	files: z.object({
		path: z.string(),
		bucket: z.string().optional(),
	}),
	openai: z.object({
		token: z.string(),
	}),
	speechToText: z.object({
		service: z.string().regex(/google|whisper/),
		model: z.string(),
		language: z.string().optional(),
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
		worker: {
			queue: 'queue',
			mode: 'http',
			url: '/task',
			service: 'http',
		},
		api: {
			queue: 'queue',
			mode: 'appengine',
			url: '/task',
			service: 'google',
		},
		project: 'project',
		queue: 'queue',
		location: 'location',
		mode: 'appengine',
		url: '/tasks',
		service: 'google',
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
		model: 'small',
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
		worker: {
			queue: process.env.GCLOUD_WORKER_TASK_QUEUE,
			mode: process.env.GCLOUD_WORKER_TASK_MODE,
			url: process.env.WORKER_TASK_URL,
			service: process.env.WORKER_TASK_SERVICE,
		},
		api: {
			queue: process.env.GCLOUD_API_TASK_QUEUE,
			mode: process.env.GCLOUD_API_TASK_MODE,
			url: process.env.API_TASK_URL,
			service: process.env.API_TASK_SERVICE,
		},
		project: process.env.GCLOUD_PROJECT,
		queue: process.env.GCLOUD_TASK_QUEUE,
		location: process.env.GCLOUD_LOCATION,
		mode: process.env.GCLOUD_TASK_MODE,
		url: process.env.TASK_URL,
		service: process.env.TASK_SERVICE,
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
		model: process.env.WHISPER_MODEL,
		language: process.env.WHISPER_LANGUAGE,
	},
	summary: {
		durationForSummary: process.env.DURATION_FOR_SUMMARY || 60000,
	},
};

export type Config = z.infer<typeof config>;
export const getConfig = () =>
	config.parse(process.env.APP_ENV === 'test' ? testConfig : envConfig);
