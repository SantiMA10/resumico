export const CounterMetrics = {
	SEND_SUMMARY_STARTED: 'SEND_SUMMARY_STARTED',
	SEND_SUMMARY_COMPLETED: 'SEND_SUMMARY_COMPLETED',
	SEND_SUMMARY_FAILED: 'SEND_SUMMARY_FAILED',
	SEND_TRANSCRIPTION_STARTED: 'SEND_TRANSCRIPTION_STARTED',
	SEND_TRANSCRIPTION_COMPLETED: 'SEND_TRANSCRIPTION_COMPLETED',
	SEND_TRANSCRIPTION_FAILED: 'SEND_TRANSCRIPTION_FAILED',
	SEND_TRANSCRIPTION_AND_SUMMARY_STARTED: 'SEND_TRANSCRIPTION_AND_SUMMARY_STARTED',
	SEND_TRANSCRIPTION_AND_SUMMARY_COMPLETED: 'SEND_TRANSCRIPTION_AND_SUMMARY_COMPLETED',
	SEND_TRANSCRIPTION_AND_SUMMARY_FAILED: 'SEND_TRANSCRIPTION_AND_SUMMARY_FAILED',
	WHISPER_TRANSCRIPTION_STARTED: 'WHISPER_TRANSCRIPTION_STARTED',
	WHISPER_TRANSCRIPTION_COMPLETED: 'WHISPER_TRANSCRIPTION_COMPLETED',
	WHISPER_TRANSCRIPTION_FAILED: 'WHISPER_TRANSCRIPTION_FAILED',
	SEND_FEEDBACK_FROM_REQUESTED: 'SEND_FEEDBACK_FROM_REQUESTED',
	SEND_FEEDBACK_FROM_FAILED: 'SEND_FEEDBACK_FROM_FAILED',
};

export const HistogramMetrics = {
	SEND_SUMMARY_TOTAL_TIME: 'sendSummary.total',
	SEND_TRANSCRIPTION_TOTAL_TIME: 'sendTranscription.total',
	SEND_TRANSCRIPTION_AND_SUMMARY_TOTAL_TIME: 'sendTranscription.total',
	WHISPER_TRANSCRIPTION_TIME: 'whisper.transcription',
	WHISPER_AUDIO_DURATION: 'whisper.audioDuration',
};
