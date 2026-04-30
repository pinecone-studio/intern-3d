'use client';

import { useState } from 'react';

const clubs = [
  {
    status: 'Open spots',
    name: 'Creative Writing Club',
    room: 'Room 204',
    teacher: 'Ms. Saruul',
    schedule: 'Tue, Thu · 15:30',
    seats: '12 / 18 students',
    note: 'Weekly prompts, storytelling games, and a term-end mini magazine.',
  },
  {
    status: 'Almost full',
    name: 'Robotics Lab',
    room: 'Lab 102',
    teacher: 'Mr. Bat-Erdene',
    schedule: 'Mon, Wed · 16:00',
    seats: '14 / 16 students',
    note: 'Build simple bots, learn teamwork, and prepare for demo day.',
  },
  {
    status: 'Open spots',
    name: 'Public Speaking Circle',
    room: 'Hall B',
    teacher: 'Ms. Nomin',
    schedule: 'Fri · 14:30',
    seats: '9 / 20 students',
    note: 'Confidence drills, speech practice, and short presentation rounds.',
  },
] as const;

const steps = ['Browse clubs', 'Send one request', 'Wait for teacher review'] as const;

const rules = [
  'One student can send only one active request.',
  'If a club reaches capacity, requests close automatically.',
  'Teacher approval is required before you are officially added.',
] as const;

export default function StudentsPage() {
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [expandedClub, setExpandedClub] = useState<string | null>(clubs[0].name);

  const handleRequest = (clubName: string) => {
    setActiveRequest(clubName);
  };

  const toggleDetails = (clubName: string) => {
    setExpandedClub((current) => (current === clubName ? null : clubName));
  };

  return (
    <main className="student-shell">
      <section className="student-frame">
        <header className="student-hero">
          <div>
            <p className="section-label">Student dashboard</p>
            <h1>Browse clubs and choose the one that fits your interest best.</h1>
            <p className="student-hero-text">
              Ene heseg deer suragch club-uudiig harj, huvaari bolon bagshiig
              ni shalgaj, daraa ni neg request ilgeeh flow-r yavna.
            </p>
          </div>

          <div className="student-highlight">
            <p className="section-label">Current status</p>
            <strong>{activeRequest ? '1 active request' : 'No request yet'}</strong>
            <p>
              {activeRequest
                ? `${activeRequest} ruu huselt yavuulsan baina. Odoo teacher review hesegt shiljij baina.`
                : 'Request yavuulaagui baina. Songolt hiisnii daraa teacher review hesegt orno.'}
            </p>
          </div>
        </header>

        <section className="student-layout">
          <div className="student-club-grid">
            {clubs.map((club) => (
              <article key={club.name} className="student-card">
                <div className="student-card-top">
                  <span className="student-badge">{club.status}</span>
                  <span className="student-room">{club.room}</span>
                </div>

                <h2>{club.name}</h2>
                <p className="student-note">{club.note}</p>

                <dl className="student-meta">
                  <div>
                    <dt>Teacher</dt>
                    <dd>{club.teacher}</dd>
                  </div>
                  <div>
                    <dt>Schedule</dt>
                    <dd>{club.schedule}</dd>
                  </div>
                  <div>
                    <dt>Capacity</dt>
                    <dd>{club.seats}</dd>
                  </div>
                </dl>

                <div className="student-actions">
                  <button
                    type="button"
                    className="student-primary-button"
                    onClick={() => handleRequest(club.name)}
                    disabled={activeRequest !== null && activeRequest !== club.name}
                  >
                    <span>Send request</span>
                    <span className="student-button-icon" aria-hidden="true">
                      {activeRequest === club.name ? '✓' : '→'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="student-secondary-button"
                    onClick={() => toggleDetails(club.name)}
                    aria-expanded={expandedClub === club.name}
                  >
                    <span>
                      {expandedClub === club.name ? 'Hide details' : 'View details'}
                    </span>
                    <span className="student-button-icon" aria-hidden="true">
                      {expandedClub === club.name ? '−' : '+'}
                    </span>
                  </button>
                </div>

                {expandedClub === club.name ? (
                  <section className="student-detail-panel">
                    <p className="student-detail-label">Request preview</p>
                    <p className="student-detail-copy">
                      This request goes to {club.teacher} for review. Students can
                      keep only one active request at a time, so sending this will
                      lock the rest until the teacher responds.
                    </p>
                  </section>
                ) : null}
              </article>
            ))}
          </div>

          <aside className="student-sidebar">
            <section className="student-panel">
              <p className="section-label">How it flows</p>
              <h3>Request steps</h3>
              <div className="student-step-list">
                {steps.map((step, index) => (
                  <div key={step} className="student-step">
                    <span>{index + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="student-panel student-panel-accent">
              <p className="section-label">Important rules</p>
              <h3>Before you send</h3>
              <ul className="student-rule-list">
                {rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
