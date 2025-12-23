import { expect } from "@open-wc/testing";
import { Transform } from "./transform.js";

describe("Transform", () => {
	describe("constructor", () => {
		it("creates identity transform when no matrix provided", () => {
			const t = new Transform();
			expect(t.getMatrix()).to.deep.equal([1, 0, 0, 1, 0, 0]);
		});

		it("creates transform from provided matrix", () => {
			const matrix = [2, 0.5, 0.5, 2, 10, 20];
			const t = new Transform(matrix);
			expect(t.getMatrix()).to.deep.equal(matrix);
		});

		it("copies only first 6 elements of input array", () => {
			const matrix = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			const t = new Transform(matrix);
			expect(t.getMatrix()).to.have.length(6);
		});
	});

	describe("getters", () => {
		it("getScaleX returns horizontal scaling factor", () => {
			const t = new Transform([2, 0, 0, 1, 0, 0]);
			expect(t.getScaleX()).to.equal(2);
		});

		it("getScaleY returns vertical scaling factor", () => {
			const t = new Transform([1, 0, 0, 3, 0, 0]);
			expect(t.getScaleY()).to.equal(3);
		});

		it("getShearX returns horizontal shearing factor", () => {
			const t = new Transform([1, 0.5, 0, 1, 0, 0]);
			expect(t.getShearX()).to.equal(0.5);
		});

		it("getShearY returns vertical shearing factor", () => {
			const t = new Transform([1, 0, 0.5, 1, 0, 0]);
			expect(t.getShearY()).to.equal(0.5);
		});

		it("getTranslateX returns horizontal translation", () => {
			const t = new Transform([1, 0, 0, 1, 100, 0]);
			expect(t.getTranslateX()).to.equal(100);
		});

		it("getTranslateY returns vertical translation", () => {
			const t = new Transform([1, 0, 0, 1, 0, 200]);
			expect(t.getTranslateY()).to.equal(200);
		});
	});

	describe("clone", () => {
		it("creates a deep copy", () => {
			const t = new Transform([2, 0.1, 0.2, 3, 10, 20]);
			const copy = t.clone();

			expect(copy.getMatrix()).to.deep.equal(t.getMatrix());
			expect(copy).to.not.equal(t);
		});
	});

	describe("reset", () => {
		it("resets to identity transform", () => {
			const t = new Transform([2, 0.5, 0.5, 2, 10, 20]);
			t.reset();
			expect(t.getMatrix()).to.deep.equal([1, 0, 0, 1, 0, 0]);
		});
	});

	describe("setTransform", () => {
		it("copies matrix from another transform", () => {
			const source = new Transform([2, 0.1, 0.2, 3, 50, 100]);
			const target = new Transform();

			target.setTransform(source);

			expect(target.getMatrix()).to.deep.equal(source.getMatrix());
		});
	});

	describe("setValues", () => {
		it("sets all matrix values", () => {
			const t = new Transform();
			t.setValues(2, 0.1, 0.2, 3, 50, 100);

			expect(t.getScaleX()).to.equal(2);
			expect(t.getShearX()).to.equal(0.1);
			expect(t.getShearY()).to.equal(0.2);
			expect(t.getScaleY()).to.equal(3);
			expect(t.getTranslateX()).to.equal(50);
			expect(t.getTranslateY()).to.equal(100);
		});
	});

	describe("scale", () => {
		it("applies horizontal and vertical scaling", () => {
			const t = new Transform();
			t.scale(2, 3);

			expect(t.getScaleX()).to.equal(2);
			expect(t.getScaleY()).to.equal(3);
		});

		it("compounds with existing scale", () => {
			const t = new Transform([2, 0, 0, 2, 0, 0]);
			t.scale(2, 2);

			expect(t.getScaleX()).to.equal(4);
		});
	});

	describe("translate", () => {
		it("applies translation", () => {
			const t = new Transform();
			t.translate(50, 100);

			expect(t.getTranslateX()).to.equal(50);
			expect(t.getTranslateY()).to.equal(100);
		});

		it("compounds with existing translation", () => {
			const t = new Transform([1, 0, 0, 1, 10, 20]);
			t.translate(5, 10);

			expect(t.getTranslateX()).to.equal(15);
			expect(t.getTranslateY()).to.equal(30);
		});
	});

	describe("rotate", () => {
		it("applies rotation", () => {
			const t = new Transform();
			t.rotate(Math.PI / 2); // 90 degrees

			// After 90 degree rotation, scaleX should be near 0
			expect(Math.abs(t.getScaleX())).to.be.lessThan(0.0001);
		});
	});

	describe("transformPoint", () => {
		it("applies identity transform to point", () => {
			const t = new Transform();
			const result = t.transformPoint(10, 20);

			expect(result.x).to.equal(10);
			expect(result.y).to.equal(20);
		});

		it("applies translation to point", () => {
			const t = new Transform([1, 0, 0, 1, 100, 200]);
			const result = t.transformPoint(10, 20);

			expect(result.x).to.equal(110);
			expect(result.y).to.equal(220);
		});

		it("applies scaling to point", () => {
			const t = new Transform([2, 0, 0, 2, 0, 0]);
			const result = t.transformPoint(10, 20);

			expect(result.x).to.equal(20);
			expect(result.y).to.equal(40);
		});

		it("applies combined transform to point", () => {
			const t = new Transform([2, 0, 0, 2, 100, 200]);
			const result = t.transformPoint(10, 20);

			expect(result.x).to.equal(120);
			expect(result.y).to.equal(240);
		});
	});

	describe("equals", () => {
		it("returns true for equal transforms", () => {
			const t1 = new Transform([2, 0.1, 0.2, 3, 50, 100]);
			const t2 = new Transform([2, 0.1, 0.2, 3, 50, 100]);

			expect(t1.equals(t2)).to.be.true;
		});

		it("returns false for different transforms", () => {
			const t1 = new Transform([2, 0.1, 0.2, 3, 50, 100]);
			const t2 = new Transform([1, 0, 0, 1, 0, 0]);

			expect(t1.equals(t2)).to.be.false;
		});

		it("returns false for null", () => {
			const t = new Transform();
			expect(t.equals(null as any)).to.be.false;
		});
	});

	describe("toString", () => {
		it("returns string representation", () => {
			const t = new Transform([1, 2, 3, 4, 5, 6]);
			expect(t.toString()).to.equal("[1, 2, 3, 4, 5, 6]");
		});
	});

	describe("multiply", () => {
		it("multiplies with another transform", () => {
			const t1 = new Transform([2, 0, 0, 2, 0, 0]);
			const t2 = new Transform([1, 0, 0, 1, 10, 20]);

			t1.multiply(t2);

			// Multiplication affects the matrix
			expect(t1.getTranslateX()).to.equal(20);
			expect(t1.getTranslateY()).to.equal(40);
		});
	});

	describe("invert", () => {
		it("inverts the transform", () => {
			const t = new Transform([2, 0, 0, 2, 10, 20]);
			t.invert();

			// After inversion, scaling should be inverted (1/2 = 0.5)
			expect(t.getScaleX()).to.equal(0.5);
		});
	});
});

