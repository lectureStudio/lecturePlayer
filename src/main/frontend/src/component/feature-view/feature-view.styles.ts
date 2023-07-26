import { css } from 'lit';

export const featureViewStyles = css`
	:host {
		background-color: #F8F9FA;
		width: 100%;
		height: 100%;
		padding-top: 1rem;
	}
	:host > div {
		display: flex;
		background-color: #F8F9FA;
		margin-right: auto;
		margin-left: auto;
		padding-right: 0.25rem;
		padding-left: 0.25rem;
		width: 100%;
	}
	:host chat-box {
		width: 100%;
		height: 100%;
	}
	:host chat-box::part(header),
	:host quiz-box::part(header) {
		display: none;
	}
	:host #outer-split-panel {
		--min: 200px;
		--max: 350px;
	}
	:host(:not([participantsVisible])) #outer-split-panel {
		--min: 0;
	}
	:host(:not([participantsVisible])) #outer-split-panel::part(divider),
	:host(:not([participantsVisible])) .left-container {
		display: none;
	}

	sl-split-panel,
	sl-tab-group {
		width: 100%;
	}
	sl-tab-group::part(base),
	sl-tab-group::part(body),
	sl-tab-panel,
	sl-tab-panel::part(base) {
		height: 100%;
	}

	.center-container {
		min-width: 0;
	}
	.feature-container {
		display: flex;
		margin-right: auto;
		margin-left: auto;
		padding: 0 1.5rem;
		width: 100%;
		height: 100%;
	}


	@media (max-width: 400px) {
		.feature-container {
			padding: 0 0.5rem;
		}
	}
	@media (max-width: 600px) {
		:host #outer-split-panel {
			--min: 0;
		}
		:host #outer-split-panel::part(divider),
		:host .left-container {
			display: none;
		}
	}
	@media (min-width: 992px) {
		:host > div {
			max-width: 960px;
		}
	}
	@media (min-width: 1200px) {
		:host > div {
			max-width: 1140px;
		}
	}
	@media (min-width: 1400px) {
		:host > div {
			max-width: 1320px;
		}
	}
`;