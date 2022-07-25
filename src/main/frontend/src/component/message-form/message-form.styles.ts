import { css } from 'lit';

export const messageFormStyles = css`
	:host {
		width: 100%;
	}
	.controls {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		padding: 0.25em 0;
		font-size: 0.9em;
	}
	.controls > span {
		min-width: fit-content;
		padding: 0 1em 0 0.25em;
	}
	.form-select {
		max-width: fit-content;
		height: auto;
		line-height: 1em;
	}
	textarea {
		resize: none;
		border: 0;
		border-radius: 0;
		font-size: 0.9rem;
		padding: 0.25em 0.5em;
		width: 100%;
	}
	textarea:focus {   
		border-color: #86b7fe;
		outline: 0;
		box-shadow: 0 0 0 -0.25rem rgba(13, 110, 253, 0.25);
	}
`;