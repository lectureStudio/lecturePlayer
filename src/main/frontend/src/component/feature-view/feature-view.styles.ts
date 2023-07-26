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
	:host(:not([hasChat])) .chat-context,
	:host(:not([hasQuiz])) .quiz-context {
		visibility: hidden;
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

	.feature-container {
		display: flex;
		margin-right: auto;
		margin-left: auto;
		padding: 0 1.5rem;
		width: 100%;
		height: 100%;
	}

	@media (min-width: 576px) {
		:host > div {
			max-width: 540px;
		}
	}
	@media (min-width: 768px) {
		:host > div {
			flex: 0 0 auto;
			width: 66.66666667%;
			max-width: 720px;
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