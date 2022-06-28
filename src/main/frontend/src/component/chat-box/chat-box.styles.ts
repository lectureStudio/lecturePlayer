import { css } from 'lit';

export const chatBoxStyles = css`
	:host {
		display: flex;
		flex-direction: column;
	}
	.chat-header {
		background-color: var(--bs-gray-200);
		font-size: 0.875em;
		padding: 0.25rem;
		width: 100%;
	}
	.chat-controls {
		display: flex;
	}
	.chat-submit {
		display: flex;
		justify-content: flex-end;
		padding: 0.25em;
	}
	.chat-controls button {
		background-color: transparent;
		border: 0;
		border-radius: 0;
		color: #0d6efd;
		font-size: 1rem;
		padding: 0.25rem 0.5rem;
		transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
	}
	.chat-controls button:hover {
		background-color: #0d6efd;
		color: white;
	}
`;