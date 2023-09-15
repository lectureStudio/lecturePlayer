import { html } from "lit";
import { fixture } from "@open-wc/testing";
import { Color } from "../paint/color.js";
import { TextHighlightRenderer } from "./text-highlight.renderer.js";
import { Rectangle } from "../geometry/rectangle.js";
import { TextHighlightShape } from "../model/shape/text-highlight.shape.js";

describe("TextHighlightRenderer", () => {
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let shape: TextHighlightShape;
	let renderer: TextHighlightRenderer;
	let region: Rectangle;

	beforeEach(async () => {
		canvas = await fixture(html`<canvas></canvas>`);
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("2D context is null");
		}

		context = ctx;

		shape = new TextHighlightShape(0, Color.fromHex("#000"));
		renderer = new TextHighlightRenderer();
		region = new Rectangle(0, 0, 320, 240);
	});

	it("render empty shape", () => {
		renderer.render(context, shape, region);
	});

	it("render shape", () => {
		shape.addTextBounds(new Rectangle(10, 10, 20, 5));

		renderer.render(context, shape, region);
	});
});