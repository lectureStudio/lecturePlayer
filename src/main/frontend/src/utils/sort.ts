export enum SortOrder {

	Ascending,
	Descending

}

export interface SortConfig<T> {

	order: SortOrder;
	comparators: TypeComparator<T>[];

}

export type TypeComparator<T> = (a: T, b: T) => number;

export const StringComparator: TypeComparator<string> = (a: string, b: string) => {
	return a.localeCompare(b);
};

export function compare<T>(sortConfig: SortConfig<T>, a: T, b: T): number {
	let result = 0;

	for (const comparator of sortConfig.comparators) {
		result = comparator(a, b);

		if (result !== 0) {
			// Values are different, do not use next comparator.
			break;
		}
	}

	return result;
}