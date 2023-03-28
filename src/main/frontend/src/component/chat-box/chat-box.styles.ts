import { css } from 'lit';

export const chatBoxStyles = css`
	:host {
		display: flex;
		flex-direction: column;
	}
	header {
		align-self: center;
		font-weight: 600;
		padding: 0.25em;
		line-height: 1.2;
	}
	section {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow-y: hidden;
		align-items: stretch;
	}
	footer {
		display: flex;
	}
	footer sl-icon-button {
		display: var(--send-button-display, flex);
		background-color: transparent;
		border: 0;
		border-radius: var(--sl-border-radius-circle);
		color: #0d6efd;
		font-size: 1.5rem;
		padding: 0.25rem 0.5rem;
		align-self: center;
		width: 2em;
		height: 2em;
		max-width: 2em;
		min-width: 2em;
		max-height: 2em;
		min-height: 2em;
		justify-content: center;
	}
	footer sl-icon-button:hover {
		background-color: var(--sl-color-primary-50);
		color: white;
	}

	.chat-history {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
	}
	.chat-history-log {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		overflow-y: auto;
		height: 100px;
		padding: 0 15px 0 5px;
	}
	.chat-history-log > * {
		margin-bottom: 1em;
	}
`;