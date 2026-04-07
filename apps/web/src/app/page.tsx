const quickLinks = [
  { label: 'Nx Docs', href: 'https://nx.dev' },
  { label: 'Project Graph', href: '/api/hello' },
  { label: 'GitHub Actions', href: 'https://github.com/features/actions' },
];

export default function Index() {
  return (
    <main className="wrapper">
      <div className="container">
        <section id="welcome">
          <h1>
            <span>Hello there,</span> Welcome @org/web
          </h1>
          <p>This page is intentionally lightweight and CI-friendly.</p>
        </section>

        <section id="commands" className="rounded shadow">
          <h2>Quick Links</h2>
          <p>Use these to keep your Nx + CI/CD workflow moving.</p>
          <ul>
            {quickLinks.map((item) => (
              <li key={item.href}>
                <a href={item.href} target="_blank" rel="noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
