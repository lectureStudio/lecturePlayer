import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { audioVolumeButtonStyles } from './audio-volume-button.styles';
import { SlMenu, SlRange, SlTooltip } from '@shoelace-style/shoelace';
import { Utils } from '../../utils/utils';

@customElement('audio-volume-button')
export class AudioVolumeButton extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		audioVolumeButtonStyles,
	];

	@property({ type: Number, reflect: true })
	volume: number = 100;

	@property({ type: Number, reflect: true })
	volumeState: number;

	@property({ type: Boolean, reflect: true })
	muted: boolean = false;

	mutedVolume: number = null;

	@query('sl-menu')
	menu: SlMenu;

	@query('#button-tooltip')
	tooltip: SlTooltip;


	protected override firstUpdated(): void {
		this.setVolume(this.volume);
	}

	protected render() {
		return html`
			<sl-dropdown placement="top-start">
				<div slot="trigger">
					<sl-tooltip id="button-tooltip" content="${t("controls.volume")}" trigger="hover">
						<sl-button @click="${this.onButton}" id="volumeIndicator">
							<span slot="prefix" class="icon-audio-mute"></span>
							<span slot="prefix" class="icon-audio-off"></span>
							<span slot="prefix" class="icon-audio-low"></span>
							<span slot="prefix" class="icon-audio-up"></span>
							<span slot="prefix" class="icon-audio-high"></span>
						</sl-button>
					</sl-tooltip>
				</div>
				<sl-menu>
					<div class="volume-controls">
						<sl-tooltip content="${this.mutedVolume ? t("controls.audio.unmute") : t("controls.audio.mute")}" trigger="hover" hoist>
							<sl-button @click="${this.onMute}" id="volumeIndicator" size="small">
								<span slot="prefix" class="icon-audio-mute"></span>
								<span slot="prefix" class="icon-audio-off"></span>
								<span slot="prefix" class="icon-audio-low"></span>
								<span slot="prefix" class="icon-audio-up"></span>
								<span slot="prefix" class="icon-audio-high"></span>
							</sl-button>
						</sl-tooltip>
						<sl-range @sl-input="${this.onVolume}" .value="${this.volume}" id="volumeSlider" min="0" max="100" value="1" step="1" tooltip="none"></sl-range>
						<span class="volume-level">${this.volume}</span>
					</div>
				</sl-menu>
			</sl-dropdown>
		`;
	}

	private setVolume(volume: number) {
		this.volume = volume;

		if (this.volume === 0) {
			this.volumeState = 0;
		}
		else if (this.volume <= 10) {
			this.volumeState = 1;
		}
		else if (this.volume <= 50) {
			this.volumeState = 2;
		}
		else if (this.volume > 50 && this.volume < 70) {
			this.volumeState = 3;
		}
		else if (this.volume >= 70) {
			this.volumeState = 4;
		}

		this.dispatchEvent(Utils.createEvent("lect-speaker-volume", {
			volume: (this.volume / 100.0)
		}));
	}

	private onVolume(e: Event): void {
		const range = e.target as SlRange;

		this.setVolume(range.value);
	}

	private onMute() {
		this.muted = !this.muted;

		if (!this.mutedVolume) {
			this.mutedVolume = this.volume;
			this.setVolume(0);
		}
		else {
			this.setVolume(this.mutedVolume);
			this.mutedVolume = null;
		}

		this.dispatchEvent(Utils.createEvent("lect-speaker-mute", {
			muted: this.muted
		}));
	}

	private onButton() {
		this.tooltip.hide();
	}
}