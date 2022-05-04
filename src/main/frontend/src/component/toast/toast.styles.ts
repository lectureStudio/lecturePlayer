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
		align-items: center;
		box-shadow: 0 3px 6px -1px rgba(0, 0, 0, 0.12), 0 10px 36px -4px rgba(77, 96, 232, 0.3);
		position: fixed;
		opacity: 0;
		transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
		cursor: pointer;
		font-size: 0.875rem;
		min-width: 150px;
		max-width: calc(50% - 20px);
		z-index: 2147483647;
	}

	:host .close-button {
		background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
		border: 0;
		border-radius: .25rem;
		color: #000;
		cursor: pointer;
		box-sizing: content-box;
		width: 1em;
		height: 1em;
		padding: 0.25em 0.25em;
		margin-left: 0.75rem;
		opacity: 0.5;
	}
	:host([closeable]) .close-button {
		display: none;
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