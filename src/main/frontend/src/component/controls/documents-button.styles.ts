import { css } from 'lit';

export const documentsButtonStyles = css`
	sl-button::part(base),
	sl-button::part(label) {
		padding-inline-start: var(--sl-spacing-x-small);
	}
	sl-button::part(prefix) {
		font-size: 2em;
	}
	sl-button::part(base) {
		background-color: transparent;
		border: 0;
		border-radius: 0.333em;
	}
	sl-button::part(base):hover {
		background-color: rgba(222, 226, 230, 0.9);
		color: rgba(0, 125, 181, 1);
	}

	sl-menu ::part(base) {
		font-size: var(--sl-font-size-x-small);
	}
`;