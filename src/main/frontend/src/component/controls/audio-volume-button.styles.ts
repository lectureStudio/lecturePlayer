import { css } from 'lit';

export const audioVolumeButtonStyles = css`
	sl-range {
		--track-color-active: var(--sl-color-primary-600);
		--track-color-inactive: var(--sl-color-primary-100);
	}
	sl-menu {
		padding: 0;
	}

	sl-button::part(base),
	sl-button::part(label) {
		padding-inline-start: var(--sl-spacing-x-small);
	}

	.volume-controls {
		display: flex;
		gap: var(--sl-spacing-x-small);
		padding: var(--sl-spacing-2x-small);
		align-items: baseline;
	}
	.volume-level {
		display: inline-flex;
		width: 2em;
		align-self: center;
		justify-content: end;
	}

	#volumeIndicator::part(prefix) {
		font-size: 2em;
	}
	#volumeIndicator::part(base) {
		background-color: transparent;
		border: 0;
		border-radius: 0.333em;
	}
	#volumeIndicator::part(base):hover {
		background-color: rgba(222, 226, 230, 0.9);
		color: rgba(0, 125, 181, 1);
	}

	#volumeIndicator > span {
		display: none;
	}
	:host([volumeState="0"]) #volumeIndicator span:nth-child(1),
	:host([volumeState="1"]) #volumeIndicator span:nth-child(2),
	:host([volumeState="2"]) #volumeIndicator span:nth-child(3),
	:host([volumeState="3"]) #volumeIndicator span:nth-child(4),
	:host([volumeState="4"]) #volumeIndicator span:nth-child(5) {
		display: inherit;
	}
`;