import { css } from 'lit';

export const annotationLayerStyles = css`
	:root {
		--annotation-unfocused-field-background: url("data:image/svg+xml;charset=UTF-8,<svg width='1px' height='1px' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' style='fill:rgba(0, 54, 255, 0.13);'/></svg>");
		--input-focus-border-color: Highlight;
		--input-focus-outline: 1px solid Canvas;
		--input-unfocused-border-color: transparent;
		--input-disabled-border-color: transparent;
		--input-hover-border-color: black;
		--link-outline: none;
	}

	@media screen and (forced-colors: active) {
		:root {
			--input-focus-border-color: CanvasText;
			--input-unfocused-border-color: ActiveText;
			--input-disabled-border-color: GrayText;
			--input-hover-border-color: Highlight;
			--link-outline: 1.5px solid LinkText;
		}

		.annotation-layer .textWidgetAnnotation :is(input, textarea):required,
		.annotation-layer .choiceWidgetAnnotation select:required,
		.annotation-layer .buttonWidgetAnnotation:is(.checkBox, .radioButton) input:required {
			outline: 1.5px solid selectedItem;
		}

		.annotation-layer .linkAnnotation:hover {
			backdrop-filter: invert(100%);
		}
	}

	.annotation-layer {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		transform-origin: 0 0;
		z-index: 3;
	}

	.annotation-layer[data-main-rotation="90"] .norotate {
		transform: rotate(270deg) translateX(-100%);
	}

	.annotation-layer[data-main-rotation="180"] .norotate {
		transform: rotate(180deg) translate(-100%, -100%);
	}

	.annotation-layer[data-main-rotation="270"] .norotate {
		transform: rotate(90deg) translateY(-100%);
	}

	.annotation-layer canvas {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.annotation-layer section {
		position: absolute;
		text-align: initial;
		pointer-events: auto;
		box-sizing: border-box;
		transform-origin: 0 0;
	}

	.annotation-layer .linkAnnotation {
		outline: var(--link-outline);
	}

	.annotation-layer :is(.linkAnnotation, .buttonWidgetAnnotation.pushButton)>a {
		position: absolute;
		font-size: 1em;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.annotation-layer:is(.linkAnnotation, .buttonWidgetAnnotation.pushButton)>a:hover {
		opacity: 0.2;
		background: rgba(255, 255, 0, 1);
		box-shadow: 0 2px 10px rgba(255, 255, 0, 1);
	}

	.annotation-layer .textAnnotation img {
		position: absolute;
		cursor: pointer;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.annotation-layer .textWidgetAnnotation :is(input, textarea),
	.annotation-layer .choiceWidgetAnnotation select,
	.annotation-layer .buttonWidgetAnnotation:is(.checkBox, .radioButton) input {
		background-image: var(--annotation-unfocused-field-background);
		border: 2px solid var(--input-unfocused-border-color);
		box-sizing: border-box;
		font: calc(9px * var(--scale-factor)) sans-serif;
		height: 100%;
		margin: 0;
		vertical-align: top;
		width: 100%;
	}

	.annotation-layer .textWidgetAnnotation :is(input, textarea):required,
	.annotation-layer .choiceWidgetAnnotation select:required,
	.annotation-layer .buttonWidgetAnnotation:is(.checkBox, .radioButton) input:required {
		outline: 1.5px solid red;
	}

	.annotation-layer .choiceWidgetAnnotation select option {
		padding: 0;
	}

	.annotation-layer .buttonWidgetAnnotation.radioButton input {
		border-radius: 50%;
	}

	.annotation-layer .textWidgetAnnotation textarea {
		resize: none;
	}

	.annotation-layer .textWidgetAnnotation :is(input, textarea)[disabled],
	.annotation-layer .choiceWidgetAnnotation select[disabled],
	.annotation-layer .buttonWidgetAnnotation:is(.checkBox, .radioButton) input[disabled] {
		background: none;
		border: 2px solid var(--input-disabled-border-color);
		cursor: not-allowed;
	}

	.annotation-layer .textWidgetAnnotation :is(input, textarea):hover,
	.annotation-layer .choiceWidgetAnnotation select:hover,
	.annotation-layer .buttonWidgetAnnotation:is(.checkBox, .radioButton) input:hover {
		border: 2px solid var(--input-hover-border-color);
	}

	.annotation-layer .textWidgetAnnotation :is(input, textarea):hover,
	.annotation-layer .choiceWidgetAnnotation select:hover,
	.annotation-layer .buttonWidgetAnnotation.checkBox input:hover {
		border-radius: 2px;
	}

	.annotation-layer .textWidgetAnnotation :is(input, textarea):focus,
	.annotation-layer .choiceWidgetAnnotation select:focus {
		background: none;
		border: 2px solid var(--input-focus-border-color);
		border-radius: 2px;
		outline: var(--input-focus-outline);
	}

	.annotation-layer .buttonWidgetAnnotation:is(.checkBox, .radioButton) :focus {
		background-image: none;
		background-color: transparent;
	}

	.annotation-layer .buttonWidgetAnnotation.checkBox :focus {
		border: 2px solid var(--input-focus-border-color);
		border-radius: 2px;
		outline: var(--input-focus-outline);
	}

	.annotation-layer .buttonWidgetAnnotation.radioButton :focus {
		border: 2px solid var(--input-focus-border-color);
		outline: var(--input-focus-outline);
	}

	.annotation-layer .buttonWidgetAnnotation.checkBox input:checked::before,
	.annotation-layer .buttonWidgetAnnotation.checkBox input:checked::after,
	.annotation-layer .buttonWidgetAnnotation.radioButton input:checked::before {
		background-color: CanvasText;
		content: "";
		display: block;
		position: absolute;
	}

	.annotation-layer .buttonWidgetAnnotation.checkBox input:checked::before,
	.annotation-layer .buttonWidgetAnnotation.checkBox input:checked::after {
		height: 80%;
		left: 45%;
		width: 1px;
	}

	.annotation-layer .buttonWidgetAnnotation.checkBox input:checked::before {
		transform: rotate(45deg);
	}

	.annotation-layer .buttonWidgetAnnotation.checkBox input:checked::after {
		transform: rotate(-45deg);
	}

	.annotation-layer .buttonWidgetAnnotation.radioButton input:checked::before {
		border-radius: 50%;
		height: 50%;
		left: 30%;
		top: 20%;
		width: 50%;
	}

	.annotation-layer .textWidgetAnnotation input.comb {
		font-family: monospace;
		padding-left: 2px;
		padding-right: 0;
	}

	.annotation-layer .textWidgetAnnotation input.comb:focus {
		/*
		* Letter spacing is placed on the right side of each character. Hence, the
		* letter spacing of the last character may be placed outside the visible
		* area, causing horizontal scrolling. We avoid this by extending the width
		* when the element has focus and revert this when it loses focus.
		*/
		width: 103%;
	}

	.annotation-layer .buttonWidgetAnnotation:is(.checkBox, .radioButton) input {
		appearance: none;
	}

	.annotation-layer .popupTriggerArea {
		height: 100%;
		width: 100%;
	}

	.annotation-layer .fileAttachmentAnnotation .popupTriggerArea {
		position: absolute;
	}

	.annotation-layer .popupWrapper {
		position: absolute;
		top: 0;
		font-size: calc(9px * var(--scale-factor));
		width: 100%;
		min-width: calc(180px * var(--scale-factor));
		pointer-events: none;
	}

	.annotation-layer .popup {
		position: absolute;
		background-color: rgba(255, 255, 153, 1);
		box-shadow: 0 calc(2px * var(--scale-factor)) calc(5px * var(--scale-factor)) rgba(136, 136, 136, 1);
		border-radius: calc(2px * var(--scale-factor));
		padding: calc(6px * var(--scale-factor));
		margin-left: calc(5px * var(--scale-factor));
		cursor: pointer;
		font: message-box;
		white-space: normal;
		word-wrap: break-word;
		pointer-events: auto;
	}

	.annotation-layer .popup>* {
		font-size: calc(9px * var(--scale-factor));
	}

	.annotation-layer .popup h1 {
		display: inline-block;
	}

	.annotation-layer .popupDate {
		display: inline-block;
		margin-left: calc(5px * var(--scale-factor));
	}

	.annotation-layer .popupContent {
		border-top: 1px solid rgba(51, 51, 51, 1);
		margin-top: calc(2px * var(--scale-factor));
		padding-top: calc(2px * var(--scale-factor));
	}

	.annotation-layer .richText>* {
		white-space: pre-wrap;
		font-size: calc(9px * var(--scale-factor));
	}

	.annotation-layer .highlightAnnotation,
	.annotation-layer .underlineAnnotation,
	.annotation-layer .squigglyAnnotation,
	.annotation-layer .strikeoutAnnotation,
	.annotation-layer .freeTextAnnotation,
	.annotation-layer .lineAnnotation svg line,
	.annotation-layer .squareAnnotation svg rect,
	.annotation-layer .circleAnnotation svg ellipse,
	.annotation-layer .polylineAnnotation svg polyline,
	.annotation-layer .polygonAnnotation svg polygon,
	.annotation-layer .caretAnnotation,
	.annotation-layer .inkAnnotation svg polyline,
	.annotation-layer .stampAnnotation,
	.annotation-layer .fileAttachmentAnnotation {
		cursor: pointer;
	}

	.annotation-layer section svg {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.annotation-layer .annotationTextContent {
		position: absolute;
		width: 100%;
		height: 100%;
		opacity: 0;
		color: transparent;
		user-select: none;
		pointer-events: none;
	}

	.annotation-layer .annotationTextContent span {
		width: 100%;
		display: inline-block;
	}
`;