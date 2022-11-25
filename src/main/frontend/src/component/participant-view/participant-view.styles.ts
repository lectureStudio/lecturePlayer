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
	:host .controls .media-state {
		display: flex;
		background: #F3F4F633;
		bottom: 0;
		border-radius: 0.25em;
	}
	.media-state .mic-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		width: 20px;
		min-height: 20px;
		height: 20px;
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

	:host(:not([hasVideo])) video {
		display: none;
	}
	:host(:not([state="1"])) {
		display: none;
	}
	:host(:not([isLocal])) .controls .buttons {
		display: none;
	}


	:host([micActive]) #mic-remote-muted,
	:not([micActive]) #mic-remote {
		display: none;
	}
	:host([micActive]) #mic-remote,
	:not([micActive]) #mic-remote-muted {
		display: initial;
	}
	:not([micActive]) #mic-remote-muted {
		color: #DC2626;
	}


	:host([micMute]) #mic-local,
	:not([micMute]) #mic-local-muted {
		display: none;
	}
	:host([micMute]) #mic-local-muted,
	:not([micMute]) #mic-local {
		display: initial;
	}
	:host([micMute]) #mic-local-muted {
		color: #DC2626;
	}

	:host([camMute]) #cam-local,
	:not([camMute]) #cam-local-muted {
		display: none;
	}
	:host([camMute]) #cam-local-muted,
	:not([camMute]) #cam-local {
		display: initial;
	}
	:host([camMute]) #cam-local-muted {
		color: #DC2626;
	}
`;