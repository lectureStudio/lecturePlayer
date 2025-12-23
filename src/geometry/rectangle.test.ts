import { expect } from "@open-wc/testing";
import { Rectangle } from "./rectangle.js";
import { Point } from "./point.js";

describe("Rectangle", () => {
	describe("constructor", () => {
		it("creates rectangle with given dimensions", () => {
			const rect = new Rectangle(10, 20, 100, 50);

			expect(rect.x).to.equal(10);
			expect(rect.y).to.equal(20);
			expect(rect.width).to.equal(100);
			expect(rect.height).to.equal(50);
		});

		it("creates empty rectangle", () => {
			const rect = Rectangle.empty();

			expect(rect.x).to.equal(0);
			expect(rect.y).to.equal(0);
			expect(rect.width).to.equal(0);
			expect(rect.height).to.equal(0);
		});
	});

	describe("set", () => {
		it("sets all properties at once", () => {
			const rect = new Rectangle(0, 0, 0, 0);

			rect.set(10, 20, 100, 50);

			expect(rect.x).to.equal(10);
			expect(rect.y).to.equal(20);
			expect(rect.width).to.equal(100);
			expect(rect.height).to.equal(50);
		});
	});

	describe("containsPoint", () => {
		it("returns true for point inside rectangle", () => {
			const rect = new Rectangle(0, 0, 100, 100);
			const point = new Point(50, 50);

			expect(rect.containsPoint(point)).to.be.true;
		});

		it("returns true for point at origin", () => {
			const rect = new Rectangle(0, 0, 100, 100);

			expect(rect.containsPoint(new Point(0, 0))).to.be.true;
		});

		it("returns false for point outside rectangle", () => {
			const rect = new Rectangle(0, 0, 100, 100);

			expect(rect.containsPoint(new Point(-1, 50))).to.be.false;
			expect(rect.containsPoint(new Point(101, 50))).to.be.false;
			expect(rect.containsPoint(new Point(50, -1))).to.be.false;
			expect(rect.containsPoint(new Point(50, 101))).to.be.false;
		});

		it("returns false for point at far edge (exclusive boundary)", () => {
			const rect = new Rectangle(0, 0, 100, 100);

			// Far edges are exclusive in this implementation
			expect(rect.containsPoint(new Point(100, 50))).to.be.false;
			expect(rect.containsPoint(new Point(50, 100))).to.be.false;
		});
	});

	describe("containsRect", () => {
		it("returns true when rectangle fully contains another", () => {
			const outer = new Rectangle(0, 0, 100, 100);
			const inner = new Rectangle(25, 25, 50, 50);

			expect(outer.containsRect(inner)).to.be.true;
		});

		it("returns false when rectangle partially overlaps", () => {
			const rect1 = new Rectangle(0, 0, 50, 50);
			const rect2 = new Rectangle(25, 25, 50, 50);

			expect(rect1.containsRect(rect2)).to.be.false;
		});

		it("returns false for empty rectangles", () => {
			const rect = new Rectangle(0, 0, 100, 100);
			const empty = Rectangle.empty();

			expect(rect.containsRect(empty)).to.be.false;
		});
	});

	describe("intersection", () => {
		it("returns intersection of overlapping rectangles", () => {
			const rect1 = new Rectangle(0, 0, 100, 100);
			const rect2 = new Rectangle(50, 50, 100, 100);

			const result = rect1.intersection(rect2);

			expect(result).to.not.be.null;
			expect(result!.x).to.equal(50);
			expect(result!.y).to.equal(50);
			expect(result!.width).to.equal(50);
			expect(result!.height).to.equal(50);
		});

		it("returns null for non-overlapping rectangles", () => {
			const rect1 = new Rectangle(0, 0, 50, 50);
			const rect2 = new Rectangle(100, 100, 50, 50);

			const result = rect1.intersection(rect2);

			expect(result).to.be.null;
		});

		it("returns null for adjacent rectangles", () => {
			const rect1 = new Rectangle(0, 0, 50, 50);
			const rect2 = new Rectangle(50, 0, 50, 50);

			const result = rect1.intersection(rect2);

			expect(result).to.be.null;
		});

		it("returns correct intersection for contained rectangle", () => {
			const outer = new Rectangle(0, 0, 100, 100);
			const inner = new Rectangle(25, 25, 50, 50);

			const result = outer.intersection(inner);

			expect(result).to.not.be.null;
			expect(result!.x).to.equal(25);
			expect(result!.y).to.equal(25);
			expect(result!.width).to.equal(50);
			expect(result!.height).to.equal(50);
		});
	});

	describe("union", () => {
		it("modifies rectangle to include both areas", () => {
			const rect1 = new Rectangle(0, 0, 50, 50);
			const rect2 = new Rectangle(25, 25, 50, 50);

			rect1.union(rect2);

			expect(rect1.x).to.equal(0);
			expect(rect1.y).to.equal(0);
			expect(rect1.width).to.equal(75);
			expect(rect1.height).to.equal(75);
		});

		it("handles non-overlapping rectangles", () => {
			const rect1 = new Rectangle(0, 0, 25, 25);
			const rect2 = new Rectangle(75, 75, 25, 25);

			rect1.union(rect2);

			expect(rect1.x).to.equal(0);
			expect(rect1.y).to.equal(0);
			expect(rect1.width).to.equal(100);
			expect(rect1.height).to.equal(100);
		});
	});

	describe("intersectsLine", () => {
		it("returns true when line passes through rectangle", () => {
			const rect = new Rectangle(0, 0, 100, 100);

			expect(rect.intersectsLine(50, -10, 50, 110)).to.be.true;
		});

		it("returns true when line is inside rectangle", () => {
			const rect = new Rectangle(0, 0, 100, 100);

			expect(rect.intersectsLine(25, 25, 75, 75)).to.be.true;
		});

		it("returns false when line is outside rectangle", () => {
			const rect = new Rectangle(0, 0, 100, 100);

			expect(rect.intersectsLine(110, 0, 110, 100)).to.be.false;
		});
	});

	describe("isEmpty", () => {
		it("returns true for zero dimensions", () => {
			expect(new Rectangle(0, 0, 0, 0).isEmpty()).to.be.true;
			expect(new Rectangle(10, 20, 0, 0).isEmpty()).to.be.true;
		});

		it("returns true for zero width", () => {
			expect(new Rectangle(0, 0, 0, 100).isEmpty()).to.be.true;
		});

		it("returns true for zero height", () => {
			expect(new Rectangle(0, 0, 100, 0).isEmpty()).to.be.true;
		});

		it("returns true for negative dimensions", () => {
			expect(new Rectangle(0, 0, -10, 100).isEmpty()).to.be.true;
			expect(new Rectangle(0, 0, 100, -10).isEmpty()).to.be.true;
		});

		it("returns false for positive dimensions", () => {
			expect(new Rectangle(0, 0, 100, 100).isEmpty()).to.be.false;
		});
	});

	describe("equals", () => {
		it("returns true for equal rectangles", () => {
			const rect1 = new Rectangle(10, 20, 30, 40);
			const rect2 = new Rectangle(10, 20, 30, 40);

			expect(rect1.equals(rect2)).to.be.true;
		});

		it("returns false for different rectangles", () => {
			const rect1 = new Rectangle(10, 20, 30, 40);

			expect(rect1.equals(new Rectangle(11, 20, 30, 40))).to.be.false;
			expect(rect1.equals(new Rectangle(10, 21, 30, 40))).to.be.false;
			expect(rect1.equals(new Rectangle(10, 20, 31, 40))).to.be.false;
			expect(rect1.equals(new Rectangle(10, 20, 30, 41))).to.be.false;
		});

		it("returns false for null", () => {
			const rect = new Rectangle(10, 20, 30, 40);

			expect(rect.equals(null as unknown as Rectangle)).to.be.false;
		});
	});

	describe("toString", () => {
		it("returns string representation", () => {
			const rect = new Rectangle(10, 20, 30, 40);
			const str = rect.toString();

			expect(str).to.include("10");
			expect(str).to.include("20");
			expect(str).to.include("30");
			expect(str).to.include("40");
		});
	});
});
