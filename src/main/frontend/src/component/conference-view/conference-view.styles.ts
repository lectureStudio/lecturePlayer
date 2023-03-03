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

	:host([galleryView]) .screen-container {
		display:none;
	}

	:host([sideRightView]) {
		display:flex;
	}

	:host([sideRightView]) .screen-container {
		flex-basis:70%;
	}

	:host([sideRightView]) .grid-container {
		flex-basis:30%;
		margin: auto 5px;
	}
	
	:host .hide-grid {
		display: none;
	}
`;