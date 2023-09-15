import { html } from "lit";
import { fixture } from "@open-wc/testing";
import { TextRenderer } from "./text.renderer.js";
import { Rectangle } from "../geometry/rectangle.js";
import { TextShape } from "../model/shape/text.shape.js";
import { Font } from "../paint/font.js";

describe("TextRenderer", () => {
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let shape: TextShape;
	let renderer: TextRenderer;
	let region: Rectangle;

	beforeEach(async () => {
		canvas = await fixture(html`<canvas></canvas>`);
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("2D context is null");
		}

		context = ctx;

		shape = new TextShape(0);
		renderer = new TextRenderer();
		region = new Rectangle(0, 0, 320, 240);
	});

	it("render empty shape", () => {
		renderer.render(context, shape, region);
	});

	it("render shape", () => {
		shape.setFont(new Font("Arial", 10));
		shape.setText("Hello");

		renderer.render(context, shape, region);
	});

	it("render shape attributes", () => {
		const attributes: Map<string, boolean> = new Map();
		attributes.set("underline", true);
		attributes.set("strikethrough", true);

		shape.setFont(new Font("Arial", 10));
		shape.setText("Hello");
		shape.setTextAttributes(attributes);

		renderer.render(context, shape, region);
	});
});