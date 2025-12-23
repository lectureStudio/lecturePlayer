import { expect } from "@open-wc/testing";
import { Line } from "./line.js";

describe("Line", () => {
	describe("constructor", () => {
		it("creates line with correct coordinates", () => {
			const line = new Line(10, 20, 100, 200);

			expect(line.x1).to.equal(10);
			expect(line.y1).to.equal(20);
			expect(line.x2).to.equal(100);
			expect(line.y2).to.equal(200);
		});
	});

	describe("set", () => {
		it("updates line coordinates", () => {
			const line = new Line(0, 0, 0, 0);
			line.set(10, 20, 30, 40);

			expect(line.x1).to.equal(10);
			expect(line.y1).to.equal(20);
			expect(line.x2).to.equal(30);
			expect(line.y2).to.equal(40);
		});
	});

	describe("getStartPoint", () => {
		it("returns start point as Point", () => {
			const line = new Line(10, 20, 100, 200);
			const start = line.getStartPoint();

			expect(start.x).to.equal(10);
			expect(start.y).to.equal(20);
		});
	});

	describe("getEndPoint", () => {
		it("returns end point as Point", () => {
			const line = new Line(10, 20, 100, 200);
			const end = line.getEndPoint();

			expect(end.x).to.equal(100);
			expect(end.y).to.equal(200);
		});
	});

	describe("distance", () => {
		it("calculates distance from point to horizontal line", () => {
			const line = new Line(0, 0, 100, 0);
			const dist = line.distance(50, 10);

			expect(dist).to.equal(10);
		});

		it("calculates distance from point to vertical line", () => {
			const line = new Line(0, 0, 0, 100);
			const dist = line.distance(10, 50);

			expect(dist).to.equal(10);
		});

		it("returns 0 for point on line", () => {
			const line = new Line(0, 0, 100, 100);
			const dist = line.distance(50, 50);

			expect(dist).to.be.closeTo(0, 0.0001);
		});
	});

	describe("intersects", () => {
		it("returns true for crossing lines", () => {
			const line1 = new Line(0, 0, 100, 100);
			const line2 = new Line(0, 100, 100, 0);

			expect(line1.intersects(line2)).to.be.true;
		});

		it("returns false for parallel lines", () => {
			const line1 = new Line(0, 0, 100, 0);
			const line2 = new Line(0, 10, 100, 10);

			expect(line1.intersects(line2)).to.be.false;
		});

		it("returns false for non-intersecting lines", () => {
			const line1 = new Line(0, 0, 50, 50);
			const line2 = new Line(60, 60, 100, 100);

			expect(line1.intersects(line2)).to.be.false;
		});

		it("returns true for T-junction", () => {
			const line1 = new Line(0, 50, 100, 50);
			const line2 = new Line(50, 0, 50, 100);

			expect(line1.intersects(line2)).to.be.true;
		});
	});

	describe("getIntersectionPoint", () => {
		it("returns intersection point for crossing lines", () => {
			const line = new Line(0, 0, 100, 100);
			const point = line.getIntersectionPoint(0, 100, 100, 0);

			expect(point).to.not.be.null;
			expect(point!.x).to.be.closeTo(50, 0.1);
			expect(point!.y).to.be.closeTo(50, 0.1);
		});

		it("returns null for parallel lines", () => {
			const line = new Line(0, 0, 100, 0);
			const point = line.getIntersectionPoint(0, 10, 100, 10);

			expect(point).to.be.null;
		});

		it("returns null for non-intersecting lines", () => {
			const line = new Line(0, 0, 50, 50);
			const point = line.getIntersectionPoint(60, 0, 100, 40);

			expect(point).to.be.null;
		});

		it("handles perpendicular lines", () => {
			const line = new Line(0, 50, 100, 50);
			const point = line.getIntersectionPoint(50, 0, 50, 100);

			expect(point).to.not.be.null;
			expect(point!.x).to.be.closeTo(50, 0.1);
			expect(point!.y).to.be.closeTo(50, 0.1);
		});
	});

	describe("static intersects", () => {
		it("returns true for crossing line segments", () => {
			const result = Line.intersects(0, 0, 100, 100, 0, 100, 100, 0);
			expect(result).to.be.true;
		});

		it("returns false for parallel line segments", () => {
			const result = Line.intersects(0, 0, 100, 0, 0, 10, 100, 10);
			expect(result).to.be.false;
		});

		it("returns false for collinear non-overlapping segments", () => {
			const result = Line.intersects(0, 0, 50, 50, 60, 60, 100, 100);
			expect(result).to.be.false;
		});
	});
});

