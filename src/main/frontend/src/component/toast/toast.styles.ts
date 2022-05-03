import { css } from 'lit';

export const toastStyles = css`
	:host {
		--toast-color-default: #64748B;
		--toast-color-success: #10B981;
		--toast-color-info: #3B82F6;
		--toast-color-warning: #F59E0B;
		--toast-color-error: #EF4444;
		--toast-color: var(--toast-color-default);

		background: #F9FAFB;
		border-radius: 0.25em;
		border-bottom: 3px solid var(--toast-color);
		color: #374151;
		padding: 0.5em 1em;
		display: flex;
		box-shadow: 0 3px 6px -1px rgba(0, 0, 0, 0.12), 0 10px 36px -4px rgba(77, 96, 232, 0.3);
		position: fixed;
		opacity: 0;
		transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
		cursor: pointer;
		min-width: 150px;
		max-width: calc(50% - 20px);
		z-index: 2147483647;
	}

	:host([show]) {
		opacity: 1;
	}

	:host([position="0"]) {
		left: 15px;
	}
	:host([position="1"]) {
		margin-left: auto;
		margin-right: auto;
		left: 0;
		right: 0;
		max-width: fit-content;
		max-width: -moz-fit-content;
	}
	:host([position="2"]) {
		right: 15px;
	}

	:host([gravity="0"]) {
		top: -150px;
	}
	:host([gravity="1"]) {
		bottom: -150px;
	}

	:host([type="1"]) {
		--toast-color: var(--toast-color-success);
	}
	:host([type="2"]) {
		--toast-color: var(--toast-color-info);
	}
	:host([type="3"]) {
		--toast-color: var(--toast-color-warning);
	}
	:host([type="4"]) {
		--toast-color: var(--toast-color-error);
	}

	@media only screen and (max-width: 360px) {
		:host([position="0"]),
		:host([position="2"]) {
			margin-left: auto;
			margin-right: auto;
			left: 0;
			right: 0;
			max-width: fit-content;
		}
	}
`;