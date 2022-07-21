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
	:host .center {
		display: flex;
		width: 66.66666667%;
		margin-right: 1em;
	}
	:host .right {
		display: flex;
		width: 33.33333333%;
	}
	:host chat-box {
		width: 100%;
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