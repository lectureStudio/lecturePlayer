import { css } from 'lit';

export const messageFormStyles = css`
	:host {
		width: 100%;
		padding: 0 0.25rem;
	}
	:host form {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
		font-size: var(--sl-font-size-small);
	}
	form sl-select {
		max-width: fit-content;
	}
	form sl-option {
		width: 100%;
	}
	form sl-option::part(base) {
		font-size: var(--sl-font-size-x-small);
	}
	form sl-option::part(label) {
		min-width: fit-content;
	}
	form .recipient-container {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0px 0.75rem;
	}
`;