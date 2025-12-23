import { expect } from "@open-wc/testing";
import { Ellipse } from "./ellipse.js";

describe("Ellipse", () => {
	describe("constructor", () => {
		it("creates ellipse with correct properties", () => {
			const e = new Ellipse(10, 20, 100, 50);

			expect(e.x).to.equal(10);
			expect(e.y).to.equal(20);
			expect(e.width).to.equal(100);
			expect(e.height).to.equal(50);
		});

		it("calculates radiusX and radiusY", () => {
			const e = new Ellipse(0, 0, 100, 50);

			expect(e.radiusX).to.equal(50);
			expect(e.radiusY).to.equal(25);
		});

		it("calculates center coordinates", () => {
			const e = new Ellipse(10, 20, 100, 50);

			expect(e.centerX).to.equal(60);
			expect(e.centerY).to.equal(45);
		});
	});

	describe("containsPoint", () => {
		it("returns true for point at center", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.containsPoint(50, 50)).to.be.true;
		});

		it("returns true for point inside ellipse", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.containsPoint(30, 30)).to.be.true;
		});

		it("returns false for point outside ellipse", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.containsPoint(0, 0)).to.be.false;
		});

		it("returns false for point at edge", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.containsPoint(100, 50)).to.be.false;
		});

		it("returns false for zero width ellipse", () => {
			const e = new Ellipse(0, 0, 0, 100);
			expect(e.containsPoint(0, 50)).to.be.false;
		});

		it("returns false for zero height ellipse", () => {
			const e = new Ellipse(0, 0, 100, 0);
			expect(e.containsPoint(50, 0)).to.be.false;
		});
	});

	describe("containsRect", () => {
		it("returns true when ellipse contains rectangle", () => {
			const e = new Ellipse(0, 0, 200, 200);
			expect(e.containsRect(80, 80, 40, 40)).to.be.true;
		});

		it("returns false when rectangle extends outside ellipse", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.containsRect(0, 0, 50, 50)).to.be.false;
		});

		it("returns false when rectangle is completely outside", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.containsRect(200, 200, 50, 50)).to.be.false;
		});
	});

	describe("intersectsRect", () => {
		it("returns true when center is inside rectangle", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsRect(40, 40, 20, 20)).to.be.true;
		});

		it("returns true when rectangle intersects ellipse edge", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsRect(80, 40, 50, 20)).to.be.true;
		});

		it("returns false when rectangle is completely outside", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsRect(200, 200, 50, 50)).to.be.false;
		});

		it("returns false for zero width rectangle", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsRect(50, 50, 0, 10)).to.be.false;
		});

		it("returns false for zero height rectangle", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsRect(50, 50, 10, 0)).to.be.false;
		});

		it("returns false for zero width ellipse", () => {
			const e = new Ellipse(0, 0, 0, 100);
			expect(e.intersectsRect(0, 0, 10, 10)).to.be.false;
		});

		it("returns false for zero height ellipse", () => {
			const e = new Ellipse(0, 0, 100, 0);
			expect(e.intersectsRect(0, 0, 10, 10)).to.be.false;
		});
	});

	describe("intersectsLine", () => {
		it("returns true when line passes through ellipse", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsLine(0, 50, 100, 50)).to.be.true;
		});

		it("returns true when line is tangent to ellipse", () => {
			const e = new Ellipse(0, 0, 100, 100);
			// Tangent line at top
			expect(e.intersectsLine(0, 0, 100, 0)).to.be.true;
		});

		it("returns false when line misses ellipse", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsLine(0, -50, 100, -50)).to.be.false;
		});

		it("returns false for zero dimension ellipse", () => {
			const e = new Ellipse(0, 0, 0, 0);
			expect(e.intersectsLine(0, 0, 100, 100)).to.be.false;
		});

		it("handles vertical line", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsLine(50, 0, 50, 100)).to.be.true;
		});

		it("handles diagonal line", () => {
			const e = new Ellipse(0, 0, 100, 100);
			expect(e.intersectsLine(0, 0, 100, 100)).to.be.true;
		});
	});
});

