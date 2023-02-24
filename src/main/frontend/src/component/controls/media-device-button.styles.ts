import { css } from 'lit';

export const mediaDeviceButtonStyles = css`
	:host {
		position: relative;
	}

	::part(prefix) {
		font-size: 2em;
	}
	::part(base),
	::part(label) {
		padding-inline-start: var(--sl-spacing-x-small);
	}
	#enable-button::part(base) {
		background-color: transparent;
		border: 0;
		border-radius: 0.333em;
	}
	#enable-button::part(base):hover {
		background-color: rgba(222, 226, 230, 0.9);
		color: rgba(0, 125, 181, 1);
	}

	sl-dropdown {
		position: absolute;
		top: 4px;
		right: -8px;
		line-height: 0;
	}
	sl-dropdown ::part(base),
	sl-dropdown ::part(label) {
		padding-inline-start: 0;
		padding-inline-end: 0;
	}
	sl-dropdown ::part(base) {
		height: inherit;
	}
	sl-dropdown ::part(caret) {
		transform: scaleY(-1);
	}

	sl-menu ::part(base) {
		font-size: var(--sl-font-size-x-small);
	}

	sl-menu-label::part(base) {
		width: 100%;
		padding: 0 var(--sl-spacing-x-small);
	}
`;