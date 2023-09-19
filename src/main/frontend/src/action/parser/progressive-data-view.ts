class ProgressiveDataView {

	private readonly dataView: DataView;

	private offset: number;


	constructor(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number) {
		this.dataView = new DataView(buffer, byteOffset, byteLength);
		this.offset = byteOffset ? byteOffset : 0;
	}

	get byteOffset(): number {
		return this.offset;
	}

	skip(n: number): void {
		if (this.offset + n >= this.dataView.byteLength) {
			throw new Error(`Out of bounds ${this.offset + n} exceeds length ${this.dataView.byteLength}`);
		}

		this.offset += n;
	}

	getString(length: number): string {
		let text = "";
		let val = -1;

		for (let i = 0; i < length; i++) {
			val = this.getUint8();

			if (val == 0) {
				break;
			}

			text += String.fromCharCode(val);
		}

		return text;
	}

	getFloat32(littleEndian?: boolean): number {
		const value = this.dataView.getFloat32(this.offset, littleEndian);

		this.offset += 4;

		return value;
	}

	getFloat64(littleEndian?: boolean): number {
		const value = this.dataView.getFloat64(this.offset, littleEndian);

		this.offset += 8;

		return value;
	}

	getInt8(): number {
		const value = this.dataView.getInt8(this.offset);

		this.offset += 1;

		return value;
	}

	getInt16(littleEndian?: boolean): number {
		const value = this.dataView.getInt16(this.offset, littleEndian);

		this.offset += 2;

		return value;
	}

	getInt32(littleEndian?: boolean): number {
		const value = this.dataView.getInt32(this.offset, littleEndian);

		this.offset += 4;

		return value;
	}

	getInt64(littleEndian?: boolean): bigint {
		const value = this.dataView.getBigInt64(this.offset, littleEndian);

		this.offset += 8;

		return value;
	}

	getUint8(): number {
		const value = this.dataView.getUint8(this.offset);

		this.offset += 1;

		return value;
	}

	getUint16(littleEndian?: boolean): number {
		const value = this.dataView.getUint16(this.offset, littleEndian);

		this.offset += 2;

		return value;
	}

	getUint32(littleEndian?: boolean): number {
		const value = this.dataView.getUint32(this.offset, littleEndian);

		this.offset += 4;

		return value;
	}
	
	/**
	 * returns a Unint8Array with size n from the dataview
	 * @param size size of the Uint8Array
	 * @returns Uint8Array
	 */
	toUint8Array(size?:number): Uint8Array{

		if(size){
			if(size <= 0){
					throw new Error("Array Size is too small.");
			}

			const value = new Uint8Array(this.dataView.buffer.slice(this.offset),0,size);
			this.offset += size;
			return value;
		}else{
			//create new Uint8Array from the buffer with the Offset = 0 and length = buffer.byteLength-this.offset
			return new Uint8Array(this.dataView.buffer.slice(this.offset),0,this.dataView.buffer.byteLength-this.offset);
		}
		
	}
}

export { ProgressiveDataView };