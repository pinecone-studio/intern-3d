import Link from 'next/link';

const roleCards = [
  {
    href: '/students',
    label: 'Student space',
    title: 'Student',
    description:
      'Explore available clubs, compare schedules, and send your one request with confidence.',
    action: 'Browse clubs',
    tone: 'cool',
  },
  {
    href: '/teacher',
    label: 'Teacher space',
    title: 'Teacher',
    description:
      'Review incoming requests, track seat counts, and keep your club roster organized.',
    action: 'Review requests',
    tone: 'warm',
  },
  {
    href: '/admin',
    label: 'Admin space',
    title: 'Admin',
    description:
      'Create new clubs, assign teachers, and monitor how the full system is moving.',
    action: 'Open controls',
    tone: 'dark',
  },
] as const;

const checklist = [
  'Role-based entry point for early testing',
  'Simple structure before login flow is added',
  'Ready to branch into separate dashboards later',
];

export default function Page() {
  return (
    <main className="club-home">
      <section className="club-frame">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              SC
            </span>
            <div>
              <p className="brand-kicker">Team 2 project</p>
              <h2>School Clubs</h2>
            </div>
          </div>

          <div className="topbar-pill">Preview landing</div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <p className="section-label">Role entry landing</p>
            <h1>Log in before hiihgui ch gesen ehnii haragdah baidal ni iim baij bolno.</h1>
            <p className="hero-text">
              Screenshot-iin zohiomjtoi adil role songoh huudas hiilee. Gehdee
              arai iluu zeregleltei, card-uud ni iluu tod, hero heseg ni
              joohon oor visual-tai bolgoson.
            </p>
          </div>

          <aside className="hero-summary">
            <p className="section-label">Quick summary</p>
            <div className="hero-stat">
              <strong>3</strong>
              <span>role entrances</span>
            </div>
            <p className="summary-text">
              Student, teacher, admin gesen 3 turliin handalt-g neg huudsaas
              turshij uzehed belen.
            </p>
            <ul className="summary-list">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="role-grid" aria-label="Role cards">
          {roleCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`role-card role-card-${card.tone}`}
            >
              <p className="section-label">{card.label}</p>
              <h3>{card.title}</h3>
              <p className="role-description">{card.description}</p>
              <span className="role-button">
                <span>{card.action}</span>
                <span className="role-button-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
