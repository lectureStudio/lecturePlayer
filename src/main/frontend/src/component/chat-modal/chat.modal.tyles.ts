import { css } from 'lit';

export const chatModalStyles = css`
	:host article {
		padding: 0;
	}
	chat-box {
		height: 100%;
	}
	web-dialog {
		--dialog-height: 100%;
	}
	:host chat-box {
		--send-button-display: none;
	}
	button > span {
		font-size: 1.4em;
		vertical-align: text-top !important;
	}
`;