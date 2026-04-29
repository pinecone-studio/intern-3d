'use client';

import { useState } from 'react';

import { parseCsv } from '../lib/parse-csv';

const sampleCsv = `title,author,year
Clean Code,Robert C. Martin,2008
The Pragmatic Programmer,Andrew Hunt,1999
Refactoring,Martin Fowler,1999`;

export function CsvJsonConverter() {
  const [csvText, setCsvText] = useState(sampleCsv);

  let formattedJson = '';
  let errorMessage = '';

  try {
    formattedJson = JSON.stringify(parseCsv(csvText), null, 2);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Failed to parse CSV input.';
  }

  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p className="eyebrow">Joined Logic</p>
        <h2>CSV to JSON converter</h2>
        <p className="section-copy">
          Your `index.js` parsing logic is now wired into this app so you can
          paste CSV and see the JSON output immediately.
        </p>
      </div>

      <div className="converter-grid">
        <label className="editor-panel">
          <span>CSV input</span>
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            spellCheck={false}
          />
        </label>

        <section className="editor-panel output-panel" aria-live="polite">
          <span>JSON output</span>
          {errorMessage ? (
            <p className="error-text">{errorMessage}</p>
          ) : (
            <pre>{formattedJson}</pre>
          )}
        </section>
      </div>
    </section>
  );
}
