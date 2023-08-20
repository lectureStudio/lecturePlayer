export interface MediaStreamState {

	Audio?: boolean,
	Camera?: boolean,
	Screen?: boolean

}

export interface MediaStateEvent {

	userId: string;
	state: MediaStreamState;

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