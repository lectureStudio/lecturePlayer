import { css } from 'lit';

export const quizBoxStyles = css`
	:host {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
	header {
		font-weight: 600;
		margin-top: 0px;
		margin-bottom: 0.5rem;
		line-height: 1.2;
	}
	section {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow-y: hidden;
		align-items: stretch;
		padding: 0 1rem;
	}
	section quiz-form {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		overflow-y: auto;
		height: 100px;
		padding: 0px 15px 0px 5px;
	}
`;