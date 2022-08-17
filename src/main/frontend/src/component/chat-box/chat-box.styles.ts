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
	footer button {
		background-color: transparent;
		border: 0;
		border-radius: 0;
		color: #0d6efd;
		font-size: 1.5rem;
		padding: 0.25rem 0.5rem;
		transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
	}
	footer button:hover {
		background-color: #0d6efd;
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
		padding-right: 15px;
	}
	.chat-history-log > * {
		margin-bottom: 1em;
	}
`;