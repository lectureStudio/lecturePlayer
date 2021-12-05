class MediaPlayer {

	private media: HTMLMediaElement;


	constructor(media: HTMLMediaElement) {
		this.media = media;
	}

	set source(source: string) {
		this.media.src = source
	}

	get duration(): number {
		return this.media.duration;
	}

	set time(time: number) {
		this.media.currentTime = time;
	}

	get time(): number {
		return this.media.currentTime;
	}

	set muted(muted: boolean) {
		this.media.muted = muted;
	}

	get muted(): boolean {
		return this.media.muted;
	}

	set volume(volume: number) {
		this.media.volume = volume;
	}

	get volume(): number {
		return this.media.volume;
	}

	start(): void {
		this.media.play();
	}

	stop(): void {
		this.media.pause();
	}

	addDurationListener(listener: (duration: number) => void): void {
		this.media.addEventListener("durationchange", () => {
			listener(this.media.duration);
		}, false);
	}

	addTimeListener(listener: (time: number) => void): void {
		this.media.addEventListener("timeupdate", () => {
			listener(this.media.currentTime);
		}, false);
	}

	addVolumeListener(listener: (volume: number) => void): void {
		this.media.addEventListener("volumechange", () => {
			listener(this.media.volume);
		}, false);
	}

	addMutedListener(listener: (muted: boolean) => void): void {
		this.media.addEventListener("volumechange", () => {
			listener(this.media.muted);
		}, false);
	}
}

export { MediaPlayer };