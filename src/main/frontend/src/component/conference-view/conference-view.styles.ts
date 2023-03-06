import { css } from 'lit';

export const conferenceViewStyles = css`
	:host {
		margin: auto;
		width: 100%;
		height: 100%;
		position: relative;
	}

	:host .grid-container {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		width: 100%;
		height: 100%;
		align-content: center;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		vertical-align: middle;
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

	:host participant-view::part(base) {
		height: inherit;
		padding: 0;
	}
	
	:host .hide-grid {
		display: none;
	}
`;