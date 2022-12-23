import { css } from 'lit';

export const cameraSettingsStyles = css`
	:host(:not([enabled])) {
		pointer-events: none;
		opacity: 0.4;
	}
	:host player-loading {
		position: absolute;
		left: 0;
		bottom: 0;
		margin: 0.5em;
		flex-direction: row;
		justify-content: left;
	}
	:host([enabled]) player-loading,
	:host([error]) player-loading {
		display: none;
	}
	:host([error]) #save-button {
		display: none;
	}
`;