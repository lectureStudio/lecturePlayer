import { css } from 'lit';

export const modalStyles = css`
	:host {
		--dialog-backdrop-bg: rgba(0, 0, 0, 0.5);
		--dialog-border-radius: 0.25em;
		--dialog-padding: 0;
	}
	web-dialog::part(dialog) {
		border-radius: 0.3333em;
		border: 2px solid var(--dialog-bg, #fff);
	}
	header {
		background: #F3F4F6;
		border-bottom: 1px solid #E5E7EB;
		border-radius: 0.3333em 0.3333em 0 0;
		margin: -2px;
		padding: 0.5em 1em;
		font-size: 1.17em;
		font-weight: normal;
	}
	header h4 {
		padding: 0.15em 0;
	}
	article {
		padding: 1em;
	}
	footer {
		display: flex;
		justify-content: flex-end;
		background: #F3F4F6;
		border-top: 1px solid #E5E7EB;
		border-radius: 0 0 0.3333em 0.3333em;
		gap: 0.5em;
		margin: -2px;
		padding: 0.5em 1em;
	}
`;