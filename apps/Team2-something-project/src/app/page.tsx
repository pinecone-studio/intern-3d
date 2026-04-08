const cards = [
  {
    title: 'App Router Ready',
    text: 'This project now uses the same Next.js app structure as six7.',
  },
  {
    title: 'Nx Targets',
    text: 'Use build, dev, and start through the local Nx CLI.',
  },
  {
    title: 'Workspace Safe',
    text: 'The broken Nx config and lockfile issues were repaired first.',
  },
];

export default function Page() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Team 2</p>
        <h1>something-project</h1>
        <p className="lede">
          This app now follows the same Next.js Nx setup pattern as six7.
        </p>
        <div className="command-row">
          <code>npm exec nx -- dev something-project</code>
          <code>npm exec nx -- build something-project</code>
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
    </main>
  );
}
