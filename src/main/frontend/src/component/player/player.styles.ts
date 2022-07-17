import { css } from 'lit';

export const playerStyles = css`
	:host {
		width: 100%;
		height: 100%;
	}
	:host > player-loading,
	:host > player-view,
	:host > player-feature-view,
	:host > player-offline {
		display: none;
	}
	:host([state="0"]) player-loading,
	:host([state="1"]) player-view,
	:host([state="4"]) player-view,
	:host([state="2"]) player-feature-view,
	:host([state="3"]) player-offline {
		display: flex;
		background-color: #F8F9FA;
	}
`;