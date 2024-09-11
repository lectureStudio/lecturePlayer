import Papa, { ParseResult } from 'papaparse';
import { CourseCsvUser } from "../model/course-csv-user";

export function parseCsvFile(file: File) {
	return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener("load", () => {
				try {
					resolve(preprocessCsv(reader.result as string));
				}
				catch (e) {
					reject(e);
				}
			}, false);

			if (file) {
				reader.readAsText(file);
			}
			else {
				reject(new Error("Could not parse CSV file"));
			}
		})
		.then((csvText: string) => {
			return parseCsv(csvText);
		});
}

function preprocessCsv(csvText: string): string {
	if (!csvText) {
		throw new Error("CSV input is empty");
	}

	const regex = /(^"|"$)/gm;
	const regexDoubleQuote = /""/gm;
	const subst = '';

	return csvText.replace(regex, subst).replace(regexDoubleQuote, '"');
}

function parseCsv(input: string): Promise<CourseCsvUser[]> {
	return new Promise((resolve, reject) => { // (*)
		Papa.parse(input, {
			header: true,
			delimiter: ",",
			newline: "\n",
			quoteChar: '"',
			escapeChar: '"',
			skipEmptyLines: true,
			transformHeader: function (header, _) {
				return header.toLowerCase().trim();
			},
			complete: function (results) {
				resolve(mapCsvFields(results));
			},
			error: function (err) {
				reject(err);
			},
		});
	});
}

function mapCsvFields(results: ParseResult<object>): CourseCsvUser[] {
	if (!results.meta.fields) {
		return;
	}

	const firstNameField = results.meta.fields[0];
	const familyNameField = results.meta.fields[1];
	const emailField = results.meta.fields[3];

	return results.data.map(value => {
		return {
			firstName: value[firstNameField],
			familyName: value[familyNameField],
			email: value[emailField],
		}
	});
}
