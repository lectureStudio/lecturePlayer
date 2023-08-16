export interface MediaStateMessage {

	userId: string;
	state: {
		Audio: boolean,
		Camera: boolean,
		Screen: boolean
	};

}