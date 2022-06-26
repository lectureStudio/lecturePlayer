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
		flex-direction: row;
		justify-content: start;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 0.5em;
	}
	.controls svg {
		display: inline-block;
		height: 1em;
		width: 1em;
	}
	.controls #mic-muted {
		color: #DC2626;
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
`;