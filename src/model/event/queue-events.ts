export interface MediaStateEvent {

	userId: string;
	state: {
		Audio: boolean,
		Camera: boolean,
		Screen: boolean
	};

}

export interface RecordingStateEvent {

	courseId: number;
	recorded: boolean;

}

export interface SpeechStateEvent {

	requestId: string;
	accepted: boolean;

}

export interface StreamStateEvent {

	courseId: number;
	started: boolean;
	timeStarted: number;

}