import { css } from 'lit';

export const gridElementStyles = css`
	:host .inner-container {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		width: 100%;
		height: 100%;
	}

	:host(:not([isVisible])) {
		display: none;
	}
`;