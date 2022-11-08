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
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		padding: 0;
		position: relative;
	}
	:host video {
		position: absolute;
		border: 1px solid;
		max-width: 100%;
		max-height: 100%;
		z-index: 1;
	}

	:host(:not([hasVideo])),
	:host(:not([state="1"])) {
		display: none;
	}
`;