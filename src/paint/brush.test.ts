import { expect } from "@open-wc/testing";
import { Brush } from "./brush.js";
import { Color } from "./color.js";

describe("Brush", () => {
	describe("constructor", () => {
		it("creates brush with color and width", () => {
			const color = new Color(255, 0, 0);
			const brush = new Brush(color, 5);

			expect(brush.color).to.equal(color);
			expect(brush.width).to.equal(5);
		});
	});

	describe("clone", () => {
		it("creates a copy with same values", () => {
			const color = new Color(0, 255, 0);
			const original = new Brush(color, 10);
			const copy = original.clone();

			expect(copy.color.r).to.equal(0);
			expect(copy.color.g).to.equal(255);
			expect(copy.color.b).to.equal(0);
			expect(copy.width).to.equal(10);
			expect(copy).to.not.equal(original);
		});
	});

	describe("inherits from Paint", () => {
		it("has color property from Paint", () => {
			const color = new Color(100, 150, 200);
			const brush = new Brush(color, 3);

			expect(brush.color.r).to.equal(100);
			expect(brush.color.g).to.equal(150);
			expect(brush.color.b).to.equal(200);
		});

		it("can change color", () => {
			const brush = new Brush(new Color(0, 0, 0), 1);
			brush.color = new Color(255, 255, 255);

			expect(brush.color.r).to.equal(255);
		});
	});
});

