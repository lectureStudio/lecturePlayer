import { css } from 'lit';

export const slideViewStyles = css`
	:host {
		width: 100%;
		height: 100%;
		min-height: 1px;
		padding: 0;
		margin: 0;
		overflow: hidden;
		position: relative;
		text-align: center;
		box-sizing: border-box;
		display: flex;
		align-items: center !important;
		justify-content: center !important;
	}
	:host > canvas {
		position: absolute;
		transform: translate(-50%, 0);
		left: 50%;
		border: 1px solid #94A3B8;
		border-radius: 0.25em;
		box-sizing: border-box;
	}
	:host .slide-canvas {
		visibility: hidden;
		z-index: 0;
	}
	:host .action-canvas {
		z-index: 1;
	}
	:host .volatile-canvas {
		z-index: 2;
	}

	.text-layer {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		overflow: hidden;
		opacity: 0.2;
		line-height: 1;
		margin: 0 auto;
		z-index: 3;
	}
	.text-layer > span {
		color: transparent;
		position: absolute;
		white-space: pre;
		cursor: text;
		transform-origin: 0% 0%;
	}
	.text-layer .highlight {
		margin: -1px;
		padding: 1px;
		background-color: rgba(180, 0, 170, 1);
		border-radius: 4px;
	}
	.text-layer .highlight.begin {
		border-radius: 4px 0 0 4px;
	}
	.text-layer .highlight.end {
		border-radius: 0 4px 4px 0;
	}
	.text-layer .highlight.middle {
		border-radius: 0;
	}
	.text-layer .highlight.selected {
		background-color: rgba(0, 100, 0, 1);
	}
	.text-layer ::-moz-selection {
		background: rgba(0, 0, 255, 1);
	}
	.text-layer ::selection {
		background: rgba(0, 0, 255, 1);
	}
	.text-layer .endOfContent {
		display: block;
		position: absolute;
		left: 0;
		top: 100%;
		right: 0;
		bottom: 0;
		z-index: -1;
		cursor: default;
		-webkit-user-select: none;
		-moz-user-select: none;
			-ms-user-select: none;
				user-select: none;
	}
	.text-layer .endOfContent.active {
		top: 0;
	}

	.annotationLayer section {
		position: absolute;
		z-index: 4;
	}
	.annotationLayer .linkAnnotation > a {
		position: absolute;
		font-size: 1em;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
	.annotationLayer .linkAnnotation > a:hover {
		background: #ff0;
	}
`;