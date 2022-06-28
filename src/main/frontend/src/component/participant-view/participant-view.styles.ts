import { css } from 'lit';

export const participantViewStyles = css`
	:host {
		display: flex;
		width: 100%;
		height: 100%;
		background: #E2E8F0;
		border: 2px solid #94A3B8;
		box-sizing: border-box;
		overflow: hidden;
	}
	:host .container {
		display: flex;
		width: 100%;
		height: 0;
		box-sizing: border-box;
		position: relative;
		padding-bottom: 56.25%;
	}
	:host video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
	:host .name {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #334155;
	}
	:host .controls {
		position: absolute;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: start;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 0.25em;
		z-index: 2;
	}
	:host .controls .buttons {
		display: grid;
		grid-auto-flow: column;
		column-gap: 3px;
		width: 100%;
		justify-content: end;
	}
	.controls button {
		display: flex;
		align-items: center;
		background-color: #CBD5E1;
		border: none;
		color: #334155;
		height: 1.5em;
		width: 1.5em;
	}
	.controls button:hover {
		background-color: #F1F5F9;
		color: #334155;
	}
	.controls svg {
		display: inline-block;
		height: 1em;
		width: 1em;
	}
	.controls #mic-muted {
		color: #DC2626;
	}

	:host(:not([isLocal])) .controls .buttons {
		display: none;
	}

	:host(:not([micMuted])) #mic-muted {
		display: none;
	}
	:host([hasVideo]) .name {
		display: none;
	}
	:host(:not([hasVideo])) video {
		display: none;
	}

	:host([micMute]) .icon-mic,
	:not([micMute]) .icon-mic-mute {
		display: none;
	}
	:host([micMute]) .icon-mic-mute,
	:not([micMute]) .icon-mic {
		display: initial;
	}
	:host([micMute]) .icon-mic-mute {
		color: #991B1B;
	}

	:host([camMute]) .icon-cam,
	:not([camMute]) .icon-cam-mute {
		display: none;
	}
	:host([camMute]) .icon-cam-mute,
	:not([camMute]) .icon-cam {
		display: initial;
	}
	:host([camMute]) .icon-cam-mute {
		color: #991B1B;
	}
`;