import { css } from 'lit';

export const messageFormStyles = css`
	.message-header {
		padding: 0.25rem;
	}

	textarea[id=messageTextarea] {
		resize: none;
		border-radius: 0;
	}
	textarea[id=messageTextarea]:focus {   
		border-color: #86b7fe;
		outline: 0;
		box-shadow: 0 0 0 -0.25rem rgba(13, 110, 253, 0.25);
	}
`;