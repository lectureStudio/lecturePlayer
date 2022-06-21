import { css } from 'lit';

export const toastContainerStyles = css`
	:host {
		position: fixed;
		padding: 1rem;
		z-index: 9999;
		width: max-content;
		max-width: 100%;
	}
	::slotted(*:not(:last-child)) {
		margin-bottom: 1rem;
	}

	:host([position="0"]) {
		left: 0;
	}
	:host([position="1"]) {
		left: 50%;
		transform: translateX(-50%);
	}
	:host([position="2"]) {
		right: 0;
	}

	:host([gravity="0"]) {
		top: 0;
	}
	:host([gravity="1"]) {
		bottom: 0;
	}
`;

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
		position: relative;
		opacity: 1;
		cursor: pointer;
		font-size: 0.875rem;
		width: fit-content;
		min-width: 150px;
		z-index: 2147483647;
	}

	:host .close-button {
		display: flex;
		align-items: center;
		border: 0;
		border-radius: 0.25rem;
		color: #000;
		cursor: pointer;
		box-sizing: content-box;
		width: 1.25em;
		height: 1.25em;
		padding: 0.25em;
		margin-left: 0.75rem;
		opacity: 0.5;
	}
	:host(:not([closeable])) .close-button {
		display: none;
	}

	:host([show]) {
		
	}

	:host * {
		overflow: hidden;
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