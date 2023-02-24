import { css } from 'lit';

export const modalStyles = css`
	sl-dialog {
		--header-spacing: 0;
		--body-spacing: 0.5em;
		--footer-spacing: 0;
	}
	sl-dialog::part(panel) {
		position: relative;
	}
	sl-dialog::part(header) {
		background: #F3F4F6;
		border-bottom: 1px solid #E5E7EB;
		border-radius: 0.3333em 0.3333em 0 0;
		padding: 0.25em 0.75em;
	}
	sl-dialog::part(title) {
		
	}
	sl-dialog::part(body) {

	}
	sl-dialog::part(footer) {
		display: flex;
		justify-content: flex-end;
		background: #F3F4F6;
		border-top: 1px solid #E5E7EB;
		border-radius: 0 0 0.3333em 0.3333em;
		padding: 0.5em 1em;
	}

	sl-tab-panel::part(base) {
		padding: var(--sl-spacing-medium) var(--sl-spacing-x-small);
	}
`;