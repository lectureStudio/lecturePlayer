import { expect } from "@open-wc/testing";
import { ProgressiveDataView } from "./progressive-data-view.js";

describe("ProgressiveDataView", () => {
	describe("constructor", () => {
		it("creates view from ArrayBuffer", () => {
			const buffer = new ArrayBuffer(16);
			const view = new ProgressiveDataView(buffer);

			expect(view.byteOffset).to.equal(0);
		});

		it("creates view with byte offset", () => {
			const buffer = new ArrayBuffer(16);
			const view = new ProgressiveDataView(buffer, 4);

			expect(view.byteOffset).to.equal(4);
		});
	});

	describe("getInt8", () => {
		it("reads signed byte and advances offset", () => {
			const buffer = new ArrayBuffer(4);
			const dataView = new DataView(buffer);
			dataView.setInt8(0, -42);
			dataView.setInt8(1, 127);

			const view = new ProgressiveDataView(buffer);

			expect(view.getInt8()).to.equal(-42);
			expect(view.byteOffset).to.equal(1);
			expect(view.getInt8()).to.equal(127);
			expect(view.byteOffset).to.equal(2);
		});
	});

	describe("getUint8", () => {
		it("reads unsigned byte and advances offset", () => {
			const buffer = new ArrayBuffer(4);
			const dataView = new DataView(buffer);
			dataView.setUint8(0, 200);
			dataView.setUint8(1, 255);

			const view = new ProgressiveDataView(buffer);

			expect(view.getUint8()).to.equal(200);
			expect(view.getUint8()).to.equal(255);
		});
	});

	describe("getInt16", () => {
		it("reads signed 16-bit integer", () => {
			const buffer = new ArrayBuffer(4);
			const dataView = new DataView(buffer);
			dataView.setInt16(0, -12345);

			const view = new ProgressiveDataView(buffer);

			expect(view.getInt16()).to.equal(-12345);
			expect(view.byteOffset).to.equal(2);
		});

		it("supports little endian", () => {
			const buffer = new ArrayBuffer(4);
			const dataView = new DataView(buffer);
			dataView.setInt16(0, 0x1234, true);

			const view = new ProgressiveDataView(buffer);

			expect(view.getInt16(true)).to.equal(0x1234);
		});
	});

	describe("getUint16", () => {
		it("reads unsigned 16-bit integer", () => {
			const buffer = new ArrayBuffer(4);
			const dataView = new DataView(buffer);
			dataView.setUint16(0, 65000);

			const view = new ProgressiveDataView(buffer);

			expect(view.getUint16()).to.equal(65000);
			expect(view.byteOffset).to.equal(2);
		});
	});

	describe("getInt32", () => {
		it("reads signed 32-bit integer", () => {
			const buffer = new ArrayBuffer(8);
			const dataView = new DataView(buffer);
			dataView.setInt32(0, -123456789);

			const view = new ProgressiveDataView(buffer);

			expect(view.getInt32()).to.equal(-123456789);
			expect(view.byteOffset).to.equal(4);
		});

		it("reads multiple consecutive values", () => {
			const buffer = new ArrayBuffer(8);
			const dataView = new DataView(buffer);
			dataView.setInt32(0, 100);
			dataView.setInt32(4, 200);

			const view = new ProgressiveDataView(buffer);

			expect(view.getInt32()).to.equal(100);
			expect(view.getInt32()).to.equal(200);
		});
	});

	describe("getUint32", () => {
		it("reads unsigned 32-bit integer", () => {
			const buffer = new ArrayBuffer(4);
			const dataView = new DataView(buffer);
			dataView.setUint32(0, 3000000000);

			const view = new ProgressiveDataView(buffer);

			expect(view.getUint32()).to.equal(3000000000);
		});
	});

	describe("getInt64", () => {
		it("reads signed 64-bit integer", () => {
			const buffer = new ArrayBuffer(8);
			const dataView = new DataView(buffer);
			dataView.setBigInt64(0, BigInt("-9223372036854775807"));

			const view = new ProgressiveDataView(buffer);

			expect(view.getInt64()).to.equal(BigInt("-9223372036854775807"));
			expect(view.byteOffset).to.equal(8);
		});
	});

	describe("getFloat32", () => {
		it("reads 32-bit floating point", () => {
			const buffer = new ArrayBuffer(4);
			const dataView = new DataView(buffer);
			dataView.setFloat32(0, 3.14159);

			const view = new ProgressiveDataView(buffer);
			const value = view.getFloat32();

			expect(value).to.be.closeTo(3.14159, 0.0001);
			expect(view.byteOffset).to.equal(4);
		});
	});

	describe("getFloat64", () => {
		it("reads 64-bit floating point", () => {
			const buffer = new ArrayBuffer(8);
			const dataView = new DataView(buffer);
			dataView.setFloat64(0, Math.PI);

			const view = new ProgressiveDataView(buffer);
			const value = view.getFloat64();

			expect(value).to.equal(Math.PI);
			expect(view.byteOffset).to.equal(8);
		});
	});

	describe("getString", () => {
		it("reads null-terminated string", () => {
			const buffer = new ArrayBuffer(10);
			const dataView = new DataView(buffer);
			const str = "Hello";

			for (let i = 0; i < str.length; i++) {
				dataView.setUint8(i, str.charCodeAt(i));
			}
			dataView.setUint8(5, 0); // null terminator

			const view = new ProgressiveDataView(buffer);
			const result = view.getString(10);

			expect(result).to.equal("Hello");
		});

		it("reads string up to length if no null terminator", () => {
			const buffer = new ArrayBuffer(5);
			const dataView = new DataView(buffer);
			const str = "ABCDE";

			for (let i = 0; i < str.length; i++) {
				dataView.setUint8(i, str.charCodeAt(i));
			}

			const view = new ProgressiveDataView(buffer);
			const result = view.getString(5);

			expect(result).to.equal("ABCDE");
		});

		it("handles empty string", () => {
			const buffer = new ArrayBuffer(4);
			const dataView = new DataView(buffer);
			dataView.setUint8(0, 0); // null terminator at start

			const view = new ProgressiveDataView(buffer);
			const result = view.getString(4);

			expect(result).to.equal("");
		});
	});

	describe("skip", () => {
		it("advances offset by n bytes", () => {
			const buffer = new ArrayBuffer(20);
			const view = new ProgressiveDataView(buffer);

			view.skip(5);
			expect(view.byteOffset).to.equal(5);

			view.skip(3);
			expect(view.byteOffset).to.equal(8);
		});

		it("throws error when skipping past buffer end", () => {
			const buffer = new ArrayBuffer(10);
			const view = new ProgressiveDataView(buffer);

			expect(() => view.skip(10)).to.throw("Out of bounds");
		});
	});

	describe("mixed operations", () => {
		it("reads mixed data types sequentially", () => {
			const buffer = new ArrayBuffer(19);
			const dataView = new DataView(buffer);

			dataView.setInt8(0, 42);           // 1 byte
			dataView.setInt32(1, 12345);       // 4 bytes
			dataView.setFloat64(5, 3.14159);   // 8 bytes
			dataView.setUint16(13, 500);       // 2 bytes
			dataView.setInt32(15, 99999);      // 4 bytes

			const view = new ProgressiveDataView(buffer);

			expect(view.getInt8()).to.equal(42);
			expect(view.getInt32()).to.equal(12345);
			expect(view.getFloat64()).to.be.closeTo(3.14159, 0.00001);
			expect(view.getUint16()).to.equal(500);
			expect(view.getInt32()).to.equal(99999);
			expect(view.byteOffset).to.equal(19);
		});
	});
});

