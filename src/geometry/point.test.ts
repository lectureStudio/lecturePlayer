import { expect } from "@open-wc/testing";
import { Point } from "./point.js";

describe("Point", () => {
	describe("constructor", () => {
		it("creates point with given coordinates", () => {
			const point = new Point(10, 20);

			expect(point.x).to.equal(10);
			expect(point.y).to.equal(20);
		});

		it("creates point at origin", () => {
			const point = new Point(0, 0);

			expect(point.x).to.equal(0);
			expect(point.y).to.equal(0);
		});
	});

	describe("set", () => {
		it("sets x and y coordinates", () => {
			const point = new Point(0, 0);

			point.set(50, 75);

			expect(point.x).to.equal(50);
			expect(point.y).to.equal(75);
		});

		it("returns the point for chaining", () => {
			const point = new Point(0, 0);

			const result = point.set(10, 20);

			expect(result).to.equal(point);
		});
	});

	describe("add", () => {
		it("adds another point", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(5, 10);

			p1.add(p2);

			expect(p1.x).to.equal(15);
			expect(p1.y).to.equal(30);
		});

		it("does not modify the added point", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(5, 10);

			p1.add(p2);

			expect(p2.x).to.equal(5);
			expect(p2.y).to.equal(10);
		});

		it("returns the point for chaining", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(5, 10);

			const result = p1.add(p2);

			expect(result).to.equal(p1);
		});
	});

	describe("subtract", () => {
		it("subtracts another point", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(5, 10);

			p1.subtract(p2);

			expect(p1.x).to.equal(5);
			expect(p1.y).to.equal(10);
		});

		it("handles negative results", () => {
			const p1 = new Point(5, 10);
			const p2 = new Point(10, 20);

			p1.subtract(p2);

			expect(p1.x).to.equal(-5);
			expect(p1.y).to.equal(-10);
		});

		it("returns the point for chaining", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(5, 10);

			const result = p1.subtract(p2);

			expect(result).to.equal(p1);
		});
	});

	describe("multiply", () => {
		it("multiplies by scalar", () => {
			const point = new Point(10, 20);

			point.multiply(2);

			expect(point.x).to.equal(20);
			expect(point.y).to.equal(40);
		});

		it("handles zero scalar", () => {
			const point = new Point(10, 20);

			point.multiply(0);

			expect(point.x).to.equal(0);
			expect(point.y).to.equal(0);
		});

		it("handles negative scalar", () => {
			const point = new Point(10, 20);

			point.multiply(-1);

			expect(point.x).to.equal(-10);
			expect(point.y).to.equal(-20);
		});

		it("returns the point for chaining", () => {
			const point = new Point(10, 20);

			const result = point.multiply(2);

			expect(result).to.equal(point);
		});
	});

	describe("normalize", () => {
		it("normalizes to unit length", () => {
			const point = new Point(3, 4); // Length 5

			point.normalize();

			expect(point.x).to.be.closeTo(0.6, 0.001);
			expect(point.y).to.be.closeTo(0.8, 0.001);
		});

		it("results in unit length", () => {
			const point = new Point(100, 200);

			point.normalize();

			const length = Math.sqrt(point.x * point.x + point.y * point.y);
			expect(length).to.be.closeTo(1, 0.001);
		});

		it("returns the point for chaining", () => {
			const point = new Point(3, 4);

			const result = point.normalize();

			expect(result).to.equal(point);
		});
	});

	describe("distance", () => {
		it("calculates distance to another point", () => {
			const p1 = new Point(0, 0);
			const p2 = new Point(3, 4);

			const dist = p1.distance(p2);

			expect(dist).to.equal(5); // 3-4-5 triangle
		});

		it("returns 0 for same point", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(10, 20);

			expect(p1.distance(p2)).to.equal(0);
		});

		it("is symmetric", () => {
			const p1 = new Point(0, 0);
			const p2 = new Point(10, 10);

			expect(p1.distance(p2)).to.equal(p2.distance(p1));
		});

		it("calculates diagonal distance correctly", () => {
			const p1 = new Point(0, 0);
			const p2 = new Point(10, 10);

			const expected = Math.sqrt(200);
			expect(p1.distance(p2)).to.be.closeTo(expected, 0.001);
		});
	});

	describe("equals", () => {
		it("returns true for equal points", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(10, 20);

			expect(p1.equals(p2)).to.be.true;
		});

		it("returns false for different x", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(11, 20);

			expect(p1.equals(p2)).to.be.false;
		});

		it("returns false for different y", () => {
			const p1 = new Point(10, 20);
			const p2 = new Point(10, 21);

			expect(p1.equals(p2)).to.be.false;
		});

		it("returns false for undefined", () => {
			const p1 = new Point(10, 20);

			expect(p1.equals(undefined)).to.be.false;
		});
	});
});
