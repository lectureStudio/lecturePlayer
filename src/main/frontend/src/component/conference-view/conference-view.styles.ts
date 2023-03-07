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

	:host .grid-parent {
		display: grid;
		width: 100%;
		height: 100%;
		padding: 0.5em;
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
	:host([layout="1"]) .grid-parent,
	:host([layout="3"]) .grid-parent {
		height: 15%;
	}
	:host([layout="1"]) .grid-container,
	:host([layout="3"]) .grid-container {
		display: inline-block;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 1em;
	}
	:host([layout="1"]) .grid-container participant-view,
	:host([layout="3"]) .grid-container participant-view {
		display: inline-block;
		margin-right: 0.25em;
	}
	:host([layout="1"]) .grid-container participant-view:last-child,
	:host([layout="3"]) .grid-container participant-view:last-child {
		margin-right: 0;
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
	:host([layout="2"]) .grid-parent,
	:host([layout="4"]) .grid-parent {
		width: 15%;
	}
	:host([layout="2"]) .grid-container,
	:host([layout="4"]) .grid-container {
		display: block;
		padding-right: 1em;
		overflow-y: auto;
	}
	:host([layout="2"]) .grid-container participant-view,
	:host([layout="4"]) .grid-container participant-view {
		display: inline-block;
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