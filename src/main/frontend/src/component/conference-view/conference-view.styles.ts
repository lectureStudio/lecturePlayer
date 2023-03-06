import { css } from 'lit';

export const conferenceViewStyles = css`
	:host {
		margin: auto;
		width: 100%;
		max-heigth: calc(100vh - 56px);
		min-height: 0;
		position: relative;
	}

	:host .grid-container {
		display: grid;
		grid-gap: 5px;
	}

	:host([galleryView]) .screen-container {
		display:none;
	}

	:host([screenRightView]) {
		display: grid;
  		grid-template-columns: 70% 30%;
	}

	:host([screenTopView]) {
		display: grid;
  		grid-template-rows: 30% 70%;
	}

	:host([screenRightView]) .screen-container {
		margin: auto;
		width: 100%;
	}

	:host([screenRightView]) .grid-container {
		margin: auto 5px;
		overflow-y: auto;
		height: 100vh;
	}

	:host([screenTopView]) .grid-container {
		margin: auto 5px;
		overflow-x: auto;
		height: calc(100vh - 20%);
	}
	
	:host .hide-grid {
		display: none;
	}
`;