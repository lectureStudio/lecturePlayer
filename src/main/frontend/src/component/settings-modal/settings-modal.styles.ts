import { css } from 'lit';

export const settingsModalStyles = css`
	:host {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: inherit;
		justify-content: center;
	}
	.wrapper {
        opacity: 0;
        position: absolute;
        z-index: 10;
        transition: opacity 0.25s ease-in;
      }
      .wrapper:not(.open) {
        visibility: hidden;
      }
      .wrapper.open {
        align-items: center;
        display: flex;
        justify-content: center;
        width: 580px;
        height: 580px;
        opacity: 1;
        visibility: visible;
      }
      .overlay {
        background: rgba(0, 0, 0, 0.8);
        height: 100%;
        width: 100%;
        position: relative;
      }
      .dialog {
        background: #ffffff;
        border-radius: 13px;
        max-width: 600px;
        padding: 1rem;
        position: absolute;
      }
      .dialog h1 {
        margin: 0 0 10px;
      }
      .dialog button {
        background-color: #d81e5b;
        color: white;
        width: 100%;
        font-size: 16px;
        padding: 15px 32px;
        border: none;
        border-radius: 10px;
        text-decoration: none;
        display: inline-block;
        margin-top: 10px;
      }
`;