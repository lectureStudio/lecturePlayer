import { css } from 'lit';

export const conferenceViewStyles = css`
	:host {
		margin: auto;
		width: 100%;
	}
	:host .tiles-container {
		display: grid;
		grid-gap: 5px;
	}
	:host .hide-tile {
		display: none;
	}
`;