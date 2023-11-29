import { html } from "lit";
import { fixture } from "@open-wc/testing";
import { ZoomRenderer } from "./zoom.renderer.js";
import { Rectangle } from "../geometry/rectangle.js";
import { ZoomShape } from "../model/shape/zoom.shape.js";
import { Brush } from "../paint/brush.js";
import { Color } from "../paint/color.js";
import { PenPoint } from "../geometry/pen-point.js";

describe("ZoomRenderer", () => {
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let shape: ZoomShape;
	let renderer: ZoomRenderer;
	let region: Rectangle;

	beforeEach(async () => {
		canvas = await fixture(html`<canvas></canvas>`);
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("2D context is null");
		}

		context = ctx;

		shape = new ZoomShape(new Brush(Color.fromHex("#000"), 1));
		renderer = new ZoomRenderer();
		region = new Rectangle(0, 0, 320, 240);
	});

	it("render empty shape", () => {
		renderer.render(context, shape, region);
	});

	it("render shape", () => {
		shape.addPoint(new PenPoint(10, 10, 1));
		shape.addPoint(new PenPoint(20, 20, 1));

		renderer.render(context, shape, region);
	});
});