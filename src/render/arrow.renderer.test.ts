import { html } from "lit";
import { fixture } from "@open-wc/testing";
import { ArrowShape } from "../model/shape/arrow.shape.js";
import { Brush } from "../paint/brush.js";
import { Color } from "../paint/color.js";
import { ArrowRenderer } from "./arrow.renderer.js";
import { Rectangle } from "../geometry/rectangle.js";
import { PenPoint } from "../geometry/pen-point.js";

describe("ArrowRenderer", () => {
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let shape: ArrowShape;
	let renderer: ArrowRenderer;
	let region: Rectangle;

	beforeEach(async () => {
		canvas = await fixture(html`<canvas></canvas>`);
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("2D context is null");
		}

		context = ctx;

		shape = new ArrowShape(0, new Brush(Color.fromHex("#000"), 1));
		shape.addPoint(new PenPoint(10, 10, 1));
		shape.addPoint(new PenPoint(20, 20, 1));

		renderer = new ArrowRenderer();

		region = new Rectangle(0, 0, 320, 240);
	});

	it("render empty shape", () => {
		const shape = new ArrowShape(0, new Brush(Color.fromHex("#000"), 1));

		renderer.render(context, shape, region);
	});

	it("render shape", () => {
		renderer.render(context, shape, region);
	});

	it("render shape selected", () => {
		shape.setSelected(true);

		renderer.render(context, shape, region);
	});

	it("render shape two-sided", () => {
		const keyEvent = new KeyboardEvent("keydown", {
			altKey: true,
			shiftKey: true
		});

		shape.setKeyEvent(keyEvent);

		renderer.render(context, shape, region);
	});
});