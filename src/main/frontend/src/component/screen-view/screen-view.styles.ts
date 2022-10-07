import { css } from 'lit';

export const screenViewStyles = css`
	:host {
		display: flex;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}
	:host .container {
		display: flex;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		position: relative;
	}
	:host video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}

	:host(:not([hasVideo])),
	:host(:not([state="1"])) {
		display: none;
	}
`;