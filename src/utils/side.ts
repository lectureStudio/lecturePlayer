export enum Side {

	TOP = "top",
	RIGHT = "right",
	BOTTOM = "bottom",
	LEFT = "left",
	NONE = "none"

}

export class SideUtil {

	static valueOf(side: string): Side {
		return (<any>Side)[side.toUpperCase()];
	}

}