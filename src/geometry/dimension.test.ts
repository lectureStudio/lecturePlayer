import { expect } from "@open-wc/testing";
import { Dimension } from "./dimension.js";

describe("Dimension", () => {
	describe("constructor", () => {
		it("creates dimension with width and height", () => {
			const dim = new Dimension(100, 200);

			expect(dim.width).to.equal(100);
			expect(dim.height).to.equal(200);
		});

		it("handles zero dimensions", () => {
			const dim = new Dimension(0, 0);

			expect(dim.width).to.equal(0);
			expect(dim.height).to.equal(0);
		});

		it("handles negative dimensions", () => {
			const dim = new Dimension(-10, -20);

			expect(dim.width).to.equal(-10);
			expect(dim.height).to.equal(-20);
		});
	});

	describe("equals", () => {
		it("returns true for equal dimensions", () => {
			const d1 = new Dimension(100, 200);
			const d2 = new Dimension(100, 200);

			expect(d1.equals(d2)).to.be.true;
		});

		it("returns false for different widths", () => {
			const d1 = new Dimension(100, 200);
			const d2 = new Dimension(150, 200);

			expect(d1.equals(d2)).to.be.false;
		});

		it("returns false for different heights", () => {
			const d1 = new Dimension(100, 200);
			const d2 = new Dimension(100, 250);

			expect(d1.equals(d2)).to.be.false;
		});

		it("returns false for null", () => {
			const dim = new Dimension(100, 200);
			expect(dim.equals(null as any)).to.be.false;
		});

		it("handles floating point comparison", () => {
			const d1 = new Dimension(100.1, 200.2);
			const d2 = new Dimension(100.1, 200.2);

			expect(d1.equals(d2)).to.be.true;
		});
	});

	describe("toString", () => {
		it("returns string representation", () => {
			const dim = new Dimension(100, 200);
			expect(dim.toString()).to.equal("[200, 100]");
		});

		it("handles decimal values", () => {
			const dim = new Dimension(10.5, 20.5);
			expect(dim.toString()).to.equal("[20.5, 10.5]");
		});
	});
});

