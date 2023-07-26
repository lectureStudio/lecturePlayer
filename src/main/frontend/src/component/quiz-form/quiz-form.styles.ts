import { css } from 'lit';

export const quizFormStyles = css`
	:host {
		width: 100%;
	}

	form {
		gap: 0;
	}

	ol, ul, dl {
		margin: 1rem 0;
	}

	sl-radio-group::part(form-control-input) {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
	}

	sl-input {
		width: max-content;
	}

	.quiz-question {
		padding-bottom: 0.75rem;
	}
	.quiz-option {
		padding-bottom: 0.75rem;
	}
	.quiz-options {
		display: flex;
		flex-direction: column;
		padding-bottom: 0.5rem;
	}

	.error-feedback {
		width: 100%;
		font-size: 0.875em;
		color: rgb(220, 53, 69);
	}
`;