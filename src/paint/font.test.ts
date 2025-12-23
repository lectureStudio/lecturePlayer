import { expect } from "@open-wc/testing";
import { Font } from "./font.js";

describe("Font", () => {
	describe("constructor", () => {
		it("creates font with family and size", () => {
			const font = new Font("Arial", 12);

			expect(font.family).to.equal("Arial");
			expect(font.size).to.equal(12);
			expect(font.style).to.be.undefined;
			expect(font.weight).to.be.undefined;
		});

		it("creates font with all properties", () => {
			const font = new Font("Helvetica", 16, "italic", "bold");

			expect(font.family).to.equal("Helvetica");
			expect(font.size).to.equal(16);
			expect(font.style).to.equal("italic");
			expect(font.weight).to.equal("bold");
		});
	});

	describe("equals", () => {
		it("returns true for equal fonts", () => {
			const f1 = new Font("Arial", 12, "italic", "bold");
			const f2 = new Font("Arial", 12, "italic", "bold");

			expect(f1.equals(f2)).to.be.true;
		});

		it("returns true for same instance", () => {
			const font = new Font("Arial", 12);
			expect(font.equals(font)).to.be.true;
		});

		it("returns false for different family", () => {
			const f1 = new Font("Arial", 12);
			const f2 = new Font("Helvetica", 12);

			expect(f1.equals(f2)).to.be.false;
		});

		it("returns false for different size", () => {
			const f1 = new Font("Arial", 12);
			const f2 = new Font("Arial", 14);

			expect(f1.equals(f2)).to.be.false;
		});

		it("returns false for different style", () => {
			const f1 = new Font("Arial", 12, "italic");
			const f2 = new Font("Arial", 12, "normal");

			expect(f1.equals(f2)).to.be.false;
		});

		it("returns false for different weight", () => {
			const f1 = new Font("Arial", 12, undefined, "bold");
			const f2 = new Font("Arial", 12, undefined, "normal");

			expect(f1.equals(f2)).to.be.false;
		});

		it("returns false for null", () => {
			const font = new Font("Arial", 12);
			expect(font.equals(null as any)).to.be.false;
		});
	});

	describe("toString", () => {
		it("returns basic font string", () => {
			const font = new Font("Arial", 12);
			expect(font.toString()).to.equal("12px Arial");
		});

		it("includes weight before size", () => {
			const font = new Font("Arial", 12, undefined, "bold");
			expect(font.toString()).to.equal("bold 12px Arial");
		});

		it("includes style before weight", () => {
			const font = new Font("Arial", 12, "italic", "bold");
			expect(font.toString()).to.equal("italic bold 12px Arial");
		});

		it("includes only style when no weight", () => {
			const font = new Font("Arial", 12, "italic");
			expect(font.toString()).to.equal("italic 12px Arial");
		});
	});
});

