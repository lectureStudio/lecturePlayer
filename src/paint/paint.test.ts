import { expect } from "@open-wc/testing";
import { Paint } from "./paint.js";
import { Color } from "./color.js";

describe("Paint", () => {
	describe("constructor", () => {
		it("creates paint with color", () => {
			const color = new Color(255, 128, 64);
			const paint = new Paint(color);

			expect(paint.color).to.equal(color);
		});
	});

	describe("color property", () => {
		it("can get color", () => {
			const color = new Color(100, 150, 200);
			const paint = new Paint(color);

			expect(paint.color.r).to.equal(100);
			expect(paint.color.g).to.equal(150);
			expect(paint.color.b).to.equal(200);
		});

		it("can set color", () => {
			const paint = new Paint(new Color(0, 0, 0));
			paint.color = new Color(255, 255, 255);

			expect(paint.color.r).to.equal(255);
			expect(paint.color.g).to.equal(255);
			expect(paint.color.b).to.equal(255);
		});
	});
});

