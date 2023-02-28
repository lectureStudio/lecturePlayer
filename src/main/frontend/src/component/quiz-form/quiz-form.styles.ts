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

	.quiz-options {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
		padding-bottom: 0.5rem;
	}
`;