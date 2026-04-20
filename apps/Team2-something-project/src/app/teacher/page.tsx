const managedClubs = [
  {
    name: 'English Speaking Club',
    status: 'Active',
    seats: '12 / 16 filled',
    schedule: 'Mon, Wed · 15:00',
  },
  {
    name: 'Debate Club',
    status: 'Needs review',
    seats: '9 / 14 filled',
    schedule: 'Fri · 16:10',
  },
] as const;

const requests = [
  {
    student: 'Anu-Erdene',
    grade: 'Grade 7A',
    club: 'English Speaking Club',
    note: 'Wants more speaking practice and group activities.',
    state: 'Pending',
  },
  {
    student: 'Temuujin',
    grade: 'Grade 8B',
    club: 'Debate Club',
    note: 'Interested in argument structure and confidence building.',
    state: 'Pending',
  },
  {
    student: 'Nandia',
    grade: 'Grade 7C',
    club: 'English Speaking Club',
    note: 'Enjoys roleplay and presentation tasks.',
    state: 'Priority',
  },
] as const;

const responsibilities = [
  'Review new student requests every day.',
  'Approve or reject based on fit and remaining seats.',
  'Keep club capacity and schedule information accurate.',
] as const;

export default function TeacherPage() {
  return (
    <main className="teacher-shell">
      <section className="teacher-frame">
        <header className="teacher-hero">
          <div>
            <p className="section-label">Teacher dashboard</p>
            <h1>Manage club requests and keep your roster balanced.</h1>
            <p className="teacher-hero-text">
              Ene heseg deer bagsh n incoming request-uudiig shalgaj, ali
              suragchiig avah ve gedgee shiidej, club buriin capacity-g hynaad
              yavna.
            </p>
          </div>

          <div className="teacher-highlight">
            <p className="section-label">Queue summary</p>
            <strong>3 pending reviews</strong>
            <p>
              Odoo 2 club deer huselt orj irsen baina. Hamgiin turuund priority
              request-ee shalgahad belen.
            </p>
          </div>
        </header>

        <section className="teacher-layout">
          <aside className="teacher-sidebar">
            <section className="teacher-panel">
              <p className="section-label">Your clubs</p>
              <h3>Managed clubs</h3>
              <div className="teacher-club-list">
                {managedClubs.map((club) => (
                  <article key={club.name} className="teacher-club-card">
                    <div className="teacher-club-top">
                      <h4>{club.name}</h4>
                      <span className="teacher-status-badge">{club.status}</span>
                    </div>
                    <p>{club.schedule}</p>
                    <strong>{club.seats}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className="teacher-panel teacher-panel-accent">
              <p className="section-label">Responsibilities</p>
              <h3>Daily checklist</h3>
              <ul className="teacher-rule-list">
                {responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="teacher-main-panel">
            <div className="teacher-main-header">
              <div>
                <p className="section-label">Request queue</p>
                <h2>Students waiting for approval</h2>
              </div>
              <span className="teacher-pill">Needs action</span>
            </div>

            <div className="teacher-request-list">
              {requests.map((request) => (
                <article key={`${request.student}-${request.club}`} className="teacher-request-card">
                  <div className="teacher-request-head">
                    <div>
                      <h3>{request.student}</h3>
                      <p>
                        {request.grade} · {request.club}
                      </p>
                    </div>
                    <span
                      className={`teacher-request-state ${
                        request.state === 'Priority'
                          ? 'teacher-request-state-priority'
                          : ''
                      }`}
                    >
                      {request.state}
                    </span>
                  </div>

                  <p className="teacher-request-note">{request.note}</p>

                  <div className="teacher-request-actions">
                    <button type="button" className="teacher-primary-button">
                      <span>Approve</span>
                      <span className="teacher-button-icon" aria-hidden="true">
                        ✓
                      </span>
                    </button>
                    <button type="button" className="teacher-secondary-button">
                      <span>Reject</span>
                      <span className="teacher-button-icon" aria-hidden="true">
                        ×
                      </span>
                    </button>
                    <button type="button" className="teacher-ghost-button">
                      <span>View profile</span>
                      <span className="teacher-button-icon" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
