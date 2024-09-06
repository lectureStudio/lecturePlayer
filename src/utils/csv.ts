import Papa from 'papaparse';

export function parseCsvFile(file: File) {
	const reader = new FileReader();
	reader.addEventListener("load", () => {
		const csvText = preprocessCsv(reader.result);

		Papa.parse(csvText, {
			header: true,
			delimiter: ",",
			newline: "\n",
			quoteChar: '"',
			escapeChar: '"',
			transformHeader: function (header, _) {
				return header.toLowerCase().trim();
			},
			complete: function (results) {
				onCsvIsRead(results.data);
				fileInput.val('');
			},
			error: function (err, file) {
				console.error(err);
				fileInput.val('');
			}
		});
	}, false);

	if (file) {
		reader.readAsText(file);
	}
}

function preprocessCsv(csvText) {
	if (!csvText) {
		return;
	}

	const regex = /(^"|"$)/gm;
	const regexDoubleQuote = /""/gm;
	const subst = '';

	return csvText.replace(regex, subst).replace(regexDoubleQuote, '"');
}
