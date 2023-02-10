import { css } from 'lit';

export const conferenceTileStyles = css`
	:host .inner-container {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		width: 100%;
		height: 100%;
	}
	:host([talking]) .talking {
		border: 2px #32cd32 solid;
	}
	
`;