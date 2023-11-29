import { html } from "lit";
import { fixture } from "@open-wc/testing";
import { LineShape } from "../model/shape/line.shape.js";
import { Brush } from "../paint/brush.js";
import { Color } from "../paint/color.js";
import { LineRenderer } from "./line.renderer.js";
import { Rectangle } from "../geometry/rectangle.js";
import { PenPoint } from "../geometry/pen-point.js";

describe("LineRenderer", () => {
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let shape: LineShape;
	let renderer: LineRenderer;
	let region: Rectangle;

	beforeEach(async () => {
		canvas = await fixture(html`<canvas></canvas>`);
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("2D context is null");
		}

		context = ctx;

		shape = new LineShape(0, new Brush(Color.fromHex("#000"), 1));
		shape.addPoint(new PenPoint(10, 10, 1));
		shape.addPoint(new PenPoint(20, 20, 1));

		renderer = new LineRenderer();

		region = new Rectangle(0, 0, 320, 240);
	});

	it("render empty shape", () => {
		const shape = new LineShape(0, new Brush(Color.fromHex("#000"), 1));

		renderer.render(context, shape, region);
	});

	it("render shape", () => {
		renderer.render(context, shape, region);
	});

	it("render shape selected", () => {
		shape.setSelected(true);

		renderer.render(context, shape, region);
	});

	it("render shape bold", () => {
		const keyEvent = new KeyboardEvent("keydown", {
			altKey: true,
			shiftKey: true
		});

		shape.setKeyEvent(keyEvent);

		renderer.render(context, shape, region);

		// Selected and bold;
		shape.setSelected(true);

		renderer.render(context, shape, region);
	});
});