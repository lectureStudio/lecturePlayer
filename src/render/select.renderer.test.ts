import { html } from "lit";
import { fixture } from "@open-wc/testing";
import { Brush } from "../paint/brush.js";
import { Color } from "../paint/color.js";
import { SelectRenderer } from "./select.renderer.js";
import { Rectangle } from "../geometry/rectangle.js";
import { PenPoint } from "../geometry/pen-point.js";
import { SelectShape } from "../model/shape/select.shape.js";

describe("SelectRenderer", () => {
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let shape: SelectShape;
	let renderer: SelectRenderer;
	let region: Rectangle;

	beforeEach(async () => {
		canvas = await fixture(html`<canvas></canvas>`);
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("2D context is null");
		}

		context = ctx;

		shape = new SelectShape(new Brush(Color.fromHex("#000"), 1));
		shape.addPoint(new PenPoint(10, 10, 1));
		shape.addPoint(new PenPoint(20, 20, 1));

		renderer = new SelectRenderer();

		region = new Rectangle(0, 0, 320, 240);
	});

	it("render empty shape", () => {
		const shape = new SelectShape(new Brush(Color.fromHex("#000"), 1));

		renderer.render(context, shape, region);
	});

	it("render shape", () => {
		renderer.render(context, shape, region);
	});
});