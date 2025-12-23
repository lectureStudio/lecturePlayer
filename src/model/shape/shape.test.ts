import { expect } from "@open-wc/testing";
import { StrokeShape } from "./stroke.shape.js";
import { LineShape } from "./line.shape.js";
import { ArrowShape } from "./arrow.shape.js";
import { Brush } from "../../paint/brush.js";
import { Color } from "../../paint/color.js";
import { PenPoint } from "../../geometry/pen-point.js";
import { Rectangle } from "../../geometry/rectangle.js";

function createBrush(width: number = 2): Brush {
	return new Brush(new Color(0, 0, 0), width);
}

describe("StrokeShape", () => {
	describe("constructor", () => {
		it("creates shape with handle and brush", () => {
			const brush = createBrush();
			const shape = new StrokeShape(123, brush);

			expect(shape.handle).to.equal(123);
			expect(shape.brush).to.equal(brush);
		});
	});

	describe("getShapeType", () => {
		it("returns 'stroke'", () => {
			const shape = new StrokeShape(1, createBrush());
			expect(shape.getShapeType()).to.equal("stroke");
		});
	});

	describe("addPoint", () => {
		it("adds point to shape", () => {
			const shape = new StrokeShape(1, createBrush());
			shape.addPoint(new PenPoint(10, 20, 0.5));

			expect(shape.points).to.have.length(1);
		});

		it("does not add duplicate point", () => {
			const shape = new StrokeShape(1, createBrush());
			shape.addPoint(new PenPoint(10, 20, 0.5));
			shape.addPoint(new PenPoint(10, 20, 0.5));

			expect(shape.points).to.have.length(1);
		});

		it("adds different points", () => {
			const shape = new StrokeShape(1, createBrush());
			shape.addPoint(new PenPoint(10, 20, 0.5));
			shape.addPoint(new PenPoint(30, 40, 0.5));

			expect(shape.points).to.have.length(2);
		});
	});

	describe("contains", () => {
		it("returns false for empty shape", () => {
			const shape = new StrokeShape(1, createBrush());
			expect(shape.contains(new PenPoint(10, 10, 0))).to.be.false;
		});

		it("returns true for point near single point shape", () => {
			const shape = new StrokeShape(1, createBrush(10));
			shape.addPoint(new PenPoint(50, 50, 1));

			expect(shape.contains(new PenPoint(52, 52, 0))).to.be.true;
		});

		it("returns true for point on line segment", () => {
			const shape = new StrokeShape(1, createBrush(10));
			shape.addPoint(new PenPoint(0, 0, 1));
			shape.addPoint(new PenPoint(100, 100, 1));

			expect(shape.contains(new PenPoint(50, 50, 0))).to.be.true;
		});
	});

	describe("intersects", () => {
		it("returns false for empty shape", () => {
			const shape = new StrokeShape(1, createBrush());
			expect(shape.intersects(new Rectangle(0, 0, 100, 100))).to.be.false;
		});

		it("returns true when single point is inside rect", () => {
			const shape = new StrokeShape(1, createBrush());
			shape.addPoint(new PenPoint(50, 50, 1));

			expect(shape.intersects(new Rectangle(0, 0, 100, 100))).to.be.true;
		});

		it("returns true when line crosses rect", () => {
			const shape = new StrokeShape(1, createBrush());
			shape.addPoint(new PenPoint(0, 0, 1));
			shape.addPoint(new PenPoint(100, 100, 1));

			expect(shape.intersects(new Rectangle(40, 40, 20, 20))).to.be.true;
		});

		it("returns false when line misses rect", () => {
			const shape = new StrokeShape(1, createBrush());
			shape.addPoint(new PenPoint(0, 0, 1));
			shape.addPoint(new PenPoint(10, 10, 1));

			expect(shape.intersects(new Rectangle(50, 50, 20, 20))).to.be.false;
		});
	});

	describe("clone", () => {
		it("creates a copy with same properties", () => {
			const shape = new StrokeShape(1, createBrush());
			shape.addPoint(new PenPoint(10, 20, 0.5));
			shape.addPoint(new PenPoint(30, 40, 0.8));

			const copy = shape.clone();

			expect(copy.handle).to.equal(1);
			expect(copy.points).to.have.length(2);
			expect(copy).to.not.equal(shape);
		});
	});

	describe("bounds", () => {
		it("updates bounds when adding points", () => {
			const shape = new StrokeShape(1, createBrush());
			shape.addPoint(new PenPoint(10, 20, 1));
			shape.addPoint(new PenPoint(30, 40, 1));

			// Bounds are calculated from minPoint (0,0 initially) to maxPoint
			// So first point sets max, bounds go from 0 to max
			expect(shape.bounds.x).to.equal(0);
			expect(shape.bounds.y).to.equal(0);
			expect(shape.bounds.width).to.equal(30);
			expect(shape.bounds.height).to.equal(40);
		});
	});
});

describe("LineShape", () => {
	describe("getShapeType", () => {
		it("returns 'line'", () => {
			const shape = new LineShape(1, createBrush());
			expect(shape.getShapeType()).to.equal("line");
		});
	});

	describe("clone", () => {
		it("creates a copy", () => {
			const shape = new LineShape(1, createBrush());
			shape.addPoint(new PenPoint(0, 0, 1));
			shape.addPoint(new PenPoint(100, 100, 1));

			const copy = shape.clone();

			expect(copy.getShapeType()).to.equal("line");
			expect(copy.points).to.have.length(2);
		});
	});
});

describe("ArrowShape", () => {
	describe("getShapeType", () => {
		it("returns 'arrow'", () => {
			const shape = new ArrowShape(1, createBrush());
			expect(shape.getShapeType()).to.equal("arrow");
		});
	});

	describe("clone", () => {
		it("creates a copy", () => {
			const shape = new ArrowShape(1, createBrush());
			shape.addPoint(new PenPoint(0, 0, 1));
			shape.addPoint(new PenPoint(100, 100, 1));

			const copy = shape.clone();

			expect(copy.getShapeType()).to.equal("arrow");
			expect(copy.points).to.have.length(2);
		});
	});
});

