import { css } from 'lit';

export const conferenceViewStyles = css`
	:host {
		display: flex;
		margin: auto;
		width: 100%;
		height: 100%;
		position: relative;
		flex-direction: row;
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
		padding: 0.5em;
	}

	:host .screen-container {
		padding: 2em;
	}

	:host([layout="0"]) .screen-container {
		display: none;
	}

	:host([layout="1"]),
	:host([layout="3"]) {
		flex-direction: column;
	}
	:host([layout="1"]) .screen-container,
	:host([layout="3"]) .screen-container {
		height: 85%;
	}
	:host([layout="1"]) .grid-container,
	:host([layout="3"]) .grid-container {
		height: 15%;
		flex-direction: column;
		padding-bottom: 1em;
		overflow-x: auto;
	}

	:host([layout="2"]) .screen-container {
		order: 1;
	}

	:host([layout="3"]) .screen-container {
		order: 1;
	}

	:host([layout="2"]),
	:host([layout="4"]) {
		flex-direction: row;
	}
	:host([layout="2"]) .screen-container,
	:host([layout="4"]) .screen-container {
		width: 80%;
	}
	:host([layout="2"]) .grid-container,
	:host([layout="4"]) .grid-container {
		width: 20%;
		display: block;
		padding-right: 1em;
		overflow-y: auto;
	}

	:host([layout="2"]) .grid-container participant-view,
	:host([layout="4"]) .grid-container participant-view {
		margin-bottom: 0.25em;
	}
	:host([layout="2"]) .grid-container participant-view:last-child,
	:host([layout="4"]) .grid-container participant-view:last-child {
		margin-bottom: 0;
	}

	:host participant-view::part(base) {
		height: inherit;
		padding: 0;
	}
	
	:host .hide-grid {
		display: none;
	}
`;