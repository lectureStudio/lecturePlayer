import { css } from 'lit';

export const chatMessageStyles = css`
	.message-head {
		display: flex;
		font-size: 0.8rem;
		margin-bottom: 0.3em;
	}
	.message-sender {
		font-weight: bold;
	}
	.message-time {
		color: #64748B;
		align-items: end;
		justify-content: end;
		margin: 0 1em 0 0;
	}
	.chat-message-boxed {
		-webkit-border-radius: 0 5px 5px 5px;
		-moz-border-radius: 0 5px 5px 5px;
		border-radius: 0 5px 5px 5px;
		background: #F3F4F6;
		overflow-wrap: break-word;
		padding: 0.4rem 1rem;
		margin: 0 15% 0 0;
		width: fit-content;
		max-width: 80%;
	}
	.chat-message-content {
		overflow-wrap: break-word;
	}
	.message-private {
		background: #FEE2E2;
		border-radius: 4px;
		padding: 1px 6px;
		margin: 0 0 0 1em;
		height: fit-content;
	}

	:host([myself]) .message-head {
		flex-direction: row-reverse;
	}
	:host([myself]) .message-time {
		margin: 0 0 0 1em;
	}
	:host([myself]) .message-private {
		margin: 0 1em 0 0;
	}
	:host([myself]) .chat-message-boxed {
		-webkit-border-radius: 5px 0 5px 5px;
		-moz-border-radius: 5px 0 5px 5px;
		border-radius: 5px 0 5px 5px;
		background: #e3effd;
		margin: 0 0 0 15%;
		margin-left: auto;
	}
`;