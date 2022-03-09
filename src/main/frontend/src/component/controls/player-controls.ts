import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { playerControlsStyles } from './player-controls.styles';

@customElement('player-controls')
export class PlayerControls extends LitElement {

	static styles = [
		playerControlsStyles,
	];

	@query('.slide-canvas')
	slideCanvas: HTMLCanvasElement;

	@query('.action-canvas')
	actionCanvas: HTMLCanvasElement;

	@query('.volatile-canvas')
	volatileCanvas: HTMLCanvasElement;

	@query('.text-layer')
	textLayer: HTMLElement;

	@property({ type: Number, reflect: true })
	volume: number = 100;

	@property({ type: Number, reflect: true, attribute: false })
	duration: number;

	@property({ type: Boolean, reflect: true })
	fullscreen: boolean = false;


	override firstUpdated(_changedProperties: PropertyValues): void {
		// Observe fullscreen change by, e.g. escape-key.
		document.addEventListener("fullscreenchange", () => {
			this.fullscreen = document.fullscreenElement !== null;
		});
	}

	render() {
		return html`
			<div class="col nav-left">
				<button id="volumeIndicator"></button>
				<input type="range" id="volumeSlider" max="100" value="100" .value="${this.volume}">
				<span id="duration">${this.getFormattedDuration()}</span>
			</div>
			<div class="col nav-center">
				<button id="raiseHandButton">
					<svg viewBox="0 0 512 512">
						<path d="M80 320V144a32 32 0 0132-32h0a32 32 0 0132 32v112M144 256V80a32 32 0 0132-32h0a32 32 0 0132 32v160M272 241V96a32 32 0 0132-32h0a32 32 0 0132 32v224M208 240V48a32 32 0 0132-32h0a32 32 0 0132 32v192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
						<path d="M80 320c0 117.4 64 176 152 176s123.71-39.6 144-88l52.71-144c6.66-18.05 3.64-34.79-11.87-43.6h0c-15.52-8.82-35.91-4.28-44.31 11.68L336 320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
					</svg>
				</button>
				<button class="hidden" id="showQuizButton">
					<svg stroke-width="0.1" fill="currentColor" stroke="currentColor" viewBox="0 0 16 16">
						<path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" fill="currentColor" stroke="currentColor"/>
						<path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z" fill="currentColor" stroke="currentColor"/>
					</svg>
				</button>
				<button class="hidden" id="playMediaButton">
					<svg viewBox="0 0 512 512">
						<path d="M112 111v290c0 17.44 17 28.52 31 20.16l247.9-148.37c12.12-7.25 12.12-26.33 0-33.58L143 90.84c-14-8.36-31 2.72-31 20.16z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/>
					</svg>
				</button>
			</div>
			<div class="col nav-right">
				<button id="chatButton" data-bs-toggle="button" @click="${this.onChat}">
					<svg class="svg-icon" viewBox="0 0 16 16">
						<path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
						<path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8zm0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
					</svg>
				</button>
				<button id="settingsButton" @click="${this.onSettings}">
					<svg class="svg-icon" viewBox="0 0 16 16">
						<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
						<path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
					</svg>
				</button>
				<button id="fullscreenButton" @click="${this.onFullscreen}">
					<svg class="svg-icon fullscreen" viewBox="0 0 16 16">
						<path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
					</svg>
					<svg class="svg-icon fullscreen-exit" viewBox="0 0 16 16">
						<path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
					</svg>
				</button>
			</div>
		`;
	}

	private onChat(): void {

	}

	private onFullscreen(): void {
		this.fullscreen = !this.fullscreen;

		const event = new CustomEvent("fullscreen", {
			detail: {
				fullscreen: this.fullscreen
			},
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	private onSettings(): void {

	}

	private getFormattedDuration(): string {
		if (!this.duration) {
			return "";
		}
		
		const date = new Date(this.duration);
		const hours = date.getUTCHours();
		const minutes = "0" + date.getUTCMinutes();
		const seconds = "0" + date.getUTCSeconds();

		return hours + ":" + minutes.slice(-2) + ":" + seconds.slice(-2);
	}
}