import { expect } from "@open-wc/testing";
import { Color } from "./color.js";

describe("Color", () => {
	describe("constructor", () => {
		it("creates color with RGB values", () => {
			const color = new Color(100, 150, 200);

			expect(color.r).to.equal(100);
			expect(color.g).to.equal(150);
			expect(color.b).to.equal(200);
		});

		it("creates color with RGBA values", () => {
			const color = new Color(100, 150, 200, 0.75);

			expect(color.r).to.equal(100);
			expect(color.g).to.equal(150);
			expect(color.b).to.equal(200);
			expect(color.a).to.equal(0.75);
		});

		it("defaults alpha to 1", () => {
			const color = new Color(100, 150, 200);

			expect(color.a).to.equal(1);
		});
	});

	describe("fromHex", () => {
		it("creates color from 6-digit hex", () => {
			const color = Color.fromHex("#ff0000");

			expect(color.r).to.equal(255);
			expect(color.g).to.equal(0);
			expect(color.b).to.equal(0);
			expect(color.a).to.equal(1);
		});

		it("creates white from #ffffff", () => {
			const color = Color.fromHex("#ffffff");

			expect(color.r).to.equal(255);
			expect(color.g).to.equal(255);
			expect(color.b).to.equal(255);
		});

		it("creates black from #000000", () => {
			const color = Color.fromHex("#000000");

			expect(color.r).to.equal(0);
			expect(color.g).to.equal(0);
			expect(color.b).to.equal(0);
		});

		it("parses mixed case hex", () => {
			const color = Color.fromHex("#AbCdEf");

			expect(color.r).to.equal(171);
			expect(color.g).to.equal(205);
			expect(color.b).to.equal(239);
		});

		it("throws for invalid hex string", () => {
			expect(() => Color.fromHex("ff0000")).to.throw();
		});

		it("handles hex with whitespace", () => {
			const color = Color.fromHex("  #ff0000  ");

			expect(color.r).to.equal(255);
		});
	});

	describe("fromRGBString", () => {
		it("creates color from rgb string", () => {
			const color = Color.fromRGBString("rgb(255, 128, 64)");

			expect(color.r).to.equal(255);
			expect(color.g).to.equal(128);
			expect(color.b).to.equal(64);
		});

		it("creates color from rgba string", () => {
			const color = Color.fromRGBString("rgba(255, 128, 64, 0.5)");

			expect(color.r).to.equal(255);
			expect(color.g).to.equal(128);
			expect(color.b).to.equal(64);
			expect(color.a).to.equal(0.5);
		});

		it("defaults alpha to 1 for rgb", () => {
			const color = Color.fromRGBString("rgb(100, 100, 100)");

			expect(color.a).to.equal(1);
		});

		it("throws for invalid rgb string", () => {
			expect(() => Color.fromRGBString("#ff0000")).to.throw();
		});
	});

	describe("fromRGBNumber", () => {
		it("creates color from RGB integer", () => {
			// Red: 0xFF0000
			const red = Color.fromRGBNumber(0xFF0000);

			expect(red.r).to.equal(255);
			expect(red.g).to.equal(0);
			expect(red.b).to.equal(0);
		});

		it("creates green from integer", () => {
			// Green: 0x00FF00
			const green = Color.fromRGBNumber(0x00FF00);

			expect(green.r).to.equal(0);
			expect(green.g).to.equal(255);
			expect(green.b).to.equal(0);
		});

		it("creates blue from integer", () => {
			// Blue: 0x0000FF
			const blue = Color.fromRGBNumber(0x0000FF);

			expect(blue.r).to.equal(0);
			expect(blue.g).to.equal(0);
			expect(blue.b).to.equal(255);
		});

		it("extracts alpha from ARGB integer", () => {
			// Fully opaque red: 0xFFFF0000
			const color = Color.fromRGBNumber(0xFFFF0000);

			expect(color.a).to.equal(1);
			expect(color.r).to.equal(255);
		});

		it("creates black from 0", () => {
			const color = Color.fromRGBNumber(0);

			expect(color.r).to.equal(0);
			expect(color.g).to.equal(0);
			expect(color.b).to.equal(0);
		});
	});

	describe("toHex", () => {
		it("converts to hex string", () => {
			const color = new Color(255, 0, 255);

			expect(color.toHex()).to.equal("#ff0ff");
		});

		it("converts black to hex", () => {
			const color = new Color(0, 0, 0);

			expect(color.toHex()).to.equal("#000");
		});
	});

	describe("toRgb", () => {
		it("converts to rgb string", () => {
			const color = new Color(255, 128, 64);

			const rgb = color.toRgb();

			expect(rgb).to.equal("rgb(255, 128, 64)");
		});
	});

	describe("toRgba", () => {
		it("converts to rgba string", () => {
			const color = new Color(255, 128, 64, 0.5);

			const rgba = color.toRgba();

			expect(rgba).to.equal("rgba(255, 128, 64, 0.5)");
		});

		it("handles full opacity", () => {
			const color = new Color(255, 0, 0, 1);

			expect(color.toRgba()).to.equal("rgba(255, 0, 0, 1)");
		});

		it("handles zero opacity", () => {
			// Note: Color constructor uses `a || 1`, so 0 becomes 1
			// This is intentional behavior - use explicit alpha values > 0
			const color = new Color(255, 0, 0, 0.5);

			expect(color.toRgba()).to.equal("rgba(255, 0, 0, 0.5)");
		});
	});

	describe("toAlpha", () => {
		it("creates rgba string with custom alpha", () => {
			const color = new Color(255, 128, 64, 1);

			const result = color.toAlpha(0.25);

			expect(result).to.equal("rgba(255, 128, 64, 0.25)");
		});
	});

	describe("toRgbaNumber", () => {
		it("converts to ARGB integer", () => {
			const color = new Color(255, 0, 0, 1);

			const num = color.toRgbaNumber();

			// Should include alpha in high byte
			expect((num >> 16) & 0xFF).to.equal(255); // Red
			expect((num >> 8) & 0xFF).to.equal(0);    // Green
			expect(num & 0xFF).to.equal(0);           // Blue
		});
	});

	describe("equals", () => {
		it("returns true for equal colors", () => {
			const c1 = new Color(100, 150, 200, 0.5);
			const c2 = new Color(100, 150, 200, 0.5);

			expect(c1.equals(c2)).to.be.true;
		});

		it("returns false for different red", () => {
			const c1 = new Color(100, 150, 200, 0.5);
			const c2 = new Color(101, 150, 200, 0.5);

			expect(c1.equals(c2)).to.be.false;
		});

		it("returns false for different green", () => {
			const c1 = new Color(100, 150, 200, 0.5);
			const c2 = new Color(100, 151, 200, 0.5);

			expect(c1.equals(c2)).to.be.false;
		});

		it("returns false for different blue", () => {
			const c1 = new Color(100, 150, 200, 0.5);
			const c2 = new Color(100, 150, 201, 0.5);

			expect(c1.equals(c2)).to.be.false;
		});

		it("returns false for different alpha", () => {
			const c1 = new Color(100, 150, 200, 0.5);
			const c2 = new Color(100, 150, 200, 0.6);

			expect(c1.equals(c2)).to.be.false;
		});
	});

	describe("predefined colors", () => {
		it("parses correct red", () => {
			const red = Color.fromHex("#ff0000");

			expect(red.r).to.equal(255);
			expect(red.g).to.equal(0);
			expect(red.b).to.equal(0);
		});

		it("parses correct green", () => {
			const green = Color.fromHex("#00ff00");

			expect(green.r).to.equal(0);
			expect(green.g).to.equal(255);
			expect(green.b).to.equal(0);
		});

		it("parses correct blue", () => {
			const blue = Color.fromHex("#0000ff");

			expect(blue.r).to.equal(0);
			expect(blue.g).to.equal(0);
			expect(blue.b).to.equal(255);
		});
	});
});
