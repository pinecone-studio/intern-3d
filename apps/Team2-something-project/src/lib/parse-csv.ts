export type CsvRecord = Record<string, string>;

export function parseCsv(csvText: string): CsvRecord[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error('CSV input is empty.');
  }

  const headers = lines[0].split(',').map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const record: CsvRecord = {};

    headers.forEach((header, index) => {
      record[header] = values[index] !== undefined ? values[index] : '';
    });

    return record;
  });
}
