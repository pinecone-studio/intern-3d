import { CsvJsonConverter } from '../components/csv-json-converter';

const cards = [
  {
    title: 'CSV Parsing',
    text: 'The standalone Node script was converted into app-safe parsing logic.',
  },
  {
    title: 'Live Preview',
    text: 'Paste CSV into the page and inspect the generated JSON instantly.',
  },
  {
    title: 'Reusable Utility',
    text: 'The parser now lives in a shared helper that can be reused by routes or components.',
  },
];

export default function Page() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Team 2</p>
        <h1>something-project</h1>
        <p className="lede">
          This page now includes the CSV-to-JSON logic from your external
          `index.js` file, adapted for the Next.js app inside this Nx
          workspace.
        </p>
        <div className="command-row">
          <code>npm exec nx -- dev something-project</code>
          <code>npm exec nx -- test something-project</code>
        </div>
      </section>

      <section className="card-grid">
        {cards.map((card) => (
          <article key={card.title} className="card">
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <CsvJsonConverter />
    </main>
  );
}
