import { css } from 'lit';

export const conferenceViewStyles = css`
	:host {
		--tile-gap: 0.125em;
		--scroll-hint: 0px;
		--tiles-padding: 0.25em;

		display: flex;
		margin: auto;
		width: 100%;
		height: 100%;
		position: relative;
		flex-direction: row;
	}

	:host .grid-parent {
		--tile-size: calc((100% - (var(--tiles-per-page) - 1) * var(--tile-gap)) / var(--tiles-per-page));

		display: grid;
		width: 100%;
		height: 100%;
		justify-content: center;
		position: relative;
	}

	:host .grid-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--tile-gap);
		width: 100%;
		align-content: center;
		align-items: center;
		justify-content: center;
		vertical-align: middle;
		scrollbar-width: none;
		overscroll-behavior-x: contain;
		overflow: auto;
	}
	:host .grid-container participant-view {
		width: calc(var(--tile-width) * 1px);
		max-height: calc(var(--tile-height) * 1px);
	}
	:host .grid-container::-webkit-scrollbar {
		display: none;
	}

	:host .presentation-container {
		padding: 2em;
		position: relative;
	}

	.tiles {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.conference-navigation-button {
		visibility: hidden;
	}

	.conference-navigation-button--visible {
		visibility: visible;
	}

	.tiles #bottom-right-button {
		bottom: 0;
	}

	:host([layout="0"]) .conference-navigation-button {
		display: none;
	}
	:host([layout="0"]) .grid-parent {
		display: flex;
	}
	:host([layout="0"]) .presentation-container {
		display: none;
	}

	:host([layout="0"]) .tiles {
		padding: 1em;
	}
	:host([layout="1"]) .tiles {
		padding: 0 0 var(--tiles-padding) 0;
	}
	:host([layout="2"]) .tiles {
		padding: 0 0 0 var(--tiles-padding);
	}
	:host([layout="3"]) .tiles {
		padding: var(--tiles-padding) 0 0 0;
	}
	:host([layout="4"]) .tiles {
		padding: 0 var(--tiles-padding) 0 0;
	}

	:host([layout="1"]),
	:host([layout="3"]) {
		flex-direction: column;
	}
	:host([layout="1"]) .presentation-container,
	:host([layout="3"]) .presentation-container {
		height: 85%;
	}
	:host([layout="1"]) .tiles,
	:host([layout="3"]) .tiles {
		height: 15%;
		flex-direction: row;
		justify-content: center;
	}
	:host([layout="1"]) .grid-parent,
	:host([layout="3"]) .grid-parent {
		max-width: calc((calc(var(--tile-width) * 1px) * var(--tiles-per-page)) + (var(--tiles-per-page) - 1) * var(--tile-gap));
	}
	:host([layout="1"]) .grid-container,
	:host([layout="3"]) .grid-container {
		display: grid;
		grid-auto-flow: column;
		grid-auto-rows: 100%;
		grid-auto-columns: var(--tile-size);
		column-gap: var(--tile-gap);
		scroll-snap-type: x mandatory;
		scroll-padding-inline: var(--scroll-hint);
		padding-inline: var(--scroll-hint);
		overflow-y: hidden;
		justify-content: start;
	}
	:host([layout="1"]) .grid-container participant-view,
	:host([layout="3"]) .grid-container participant-view {
		display: inline-block;
		margin-right: var(--tile-gap);
	}
	:host([layout="1"]) .grid-container participant-view:last-child,
	:host([layout="3"]) .grid-container participant-view:last-child {
		margin-right: 0;
	}

	:host([layout="2"]) .presentation-container {
		order: 1;
	}

	:host([layout="3"]) .presentation-container {
		order: 1;
	}

	:host([layout="2"]),
	:host([layout="4"]) {
		flex-direction: row;
	}
	:host([layout="2"]) .presentation-container,
	:host([layout="4"]) .presentation-container {
		width: 85%;
	}
	:host([layout="2"]) .tiles,
	:host([layout="4"]) .tiles {
		width: 15%;
	}
	:host([layout="2"]) .grid-parent,
	:host([layout="4"]) .grid-parent {
		max-height: calc((calc(var(--tile-height) * 1px) * var(--tiles-per-page)) + (var(--tiles-per-page) - 1) * var(--tile-gap));
	}
	:host([layout="2"]) .grid-container,
	:host([layout="4"]) .grid-container {
		display: grid;
		grid-auto-flow: row;
		grid-auto-columns: 100%;
		grid-auto-rows: var(--tile-size);
		row-gap: var(--tile-gap);
		scroll-snap-type: y mandatory;
		scroll-padding-block: var(--scroll-hint);
		padding-block: var(--scroll-hint);
		overflow-x: hidden;
		min-height: 100%;
		height: 100%;
		width: 100%;
		place-items: center;
		align-content: start;
	}

	:host participant-view::part(base) {
		height: inherit;
		padding: 0;
	}
	
	:host .hide-grid {
		display: none;
	}
`;