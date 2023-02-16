import { css } from 'lit';

export const conferenceViewStyles = css`
	:host {
		margin: auto;
		width: 100%;
	}
	:host .grid-container {
		display: grid;
		grid-gap: 5px;
	}
	:host .hide-grid {
		display: none;
	}
`;