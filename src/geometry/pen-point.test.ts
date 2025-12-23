import { expect } from "@open-wc/testing";
import { PenPoint } from "./pen-point.js";

describe("PenPoint", () => {
	describe("constructor", () => {
		it("creates point with x, y, and pressure", () => {
			const point = new PenPoint(10, 20, 0.5);

			expect(point.x).to.equal(10);
			expect(point.y).to.equal(20);
			expect(point.p).to.equal(0.5);
		});
	});

	describe("clone", () => {
		it("creates a copy with same values", () => {
			const original = new PenPoint(10, 20, 0.5);
			const copy = original.clone();

			expect(copy.x).to.equal(10);
			expect(copy.y).to.equal(20);
			expect(copy.p).to.equal(0.5);
			expect(copy).to.not.equal(original);
		});
	});

	describe("equals", () => {
		it("returns true for equal points", () => {
			const p1 = new PenPoint(10, 20, 0.5);
			const p2 = new PenPoint(10, 20, 0.5);

			expect(p1.equals(p2)).to.be.true;
		});

		it("returns false for different x", () => {
			const p1 = new PenPoint(10, 20, 0.5);
			const p2 = new PenPoint(15, 20, 0.5);

			expect(p1.equals(p2)).to.be.false;
		});

		it("returns false for different y", () => {
			const p1 = new PenPoint(10, 20, 0.5);
			const p2 = new PenPoint(10, 25, 0.5);

			expect(p1.equals(p2)).to.be.false;
		});

		it("returns false for different pressure", () => {
			const p1 = new PenPoint(10, 20, 0.5);
			const p2 = new PenPoint(10, 20, 1.0);

			expect(p1.equals(p2)).to.be.false;
		});

		it("returns false for undefined", () => {
			const p = new PenPoint(10, 20, 0.5);
			expect(p.equals(undefined)).to.be.false;
		});
	});

	describe("createZero", () => {
		it("creates point at origin with zero pressure", () => {
			const point = PenPoint.createZero();

			expect(point.x).to.equal(0);
			expect(point.y).to.equal(0);
			expect(point.p).to.equal(0);
		});
	});

	describe("inherits from Point", () => {
		it("has set method from Point", () => {
			const point = new PenPoint(0, 0, 0.5);
			point.set(10, 20);

			expect(point.x).to.equal(10);
			expect(point.y).to.equal(20);
		});

		it("has add method from Point", () => {
			const p1 = new PenPoint(10, 20, 0.5);
			const p2 = new PenPoint(5, 10, 0.3);

			p1.add(p2);

			expect(p1.x).to.equal(15);
			expect(p1.y).to.equal(30);
		});

		it("has subtract method from Point", () => {
			const p1 = new PenPoint(10, 20, 0.5);
			const p2 = new PenPoint(5, 10, 0.3);

			p1.subtract(p2);

			expect(p1.x).to.equal(5);
			expect(p1.y).to.equal(10);
		});
	});
});

