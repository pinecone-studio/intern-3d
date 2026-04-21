import Link from 'next/link';
import { Reveal } from './reveal';

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-backdrop" />
      <div className="hero-content">
        <Reveal className="hero-copy-block" variant="left">
          <p className="landing-kicker">Team 2 school club system</p>
          <h1>
            <span>Make club</span>
            <span>registration simple</span>
            <span>for every role</span>
          </h1>

          <div className="hero-copy-stack">
            <p className="hero-copy-text">
              Students can browse clubs and apply with confidence.
            </p>
            <p className="hero-copy-text hero-copy-text-muted">
              Teachers review requests, while admins manage setup, capacity,
              and the full program in one place.
            </p>
          </div>

          <div className="hero-actions">
            <Link
              href="/students"
              className="landing-button landing-button-light hero-main-action"
            >
              Browse clubs
            </Link>
            <Link href="/admin" className="landing-button landing-button-outline">
              Open admin
            </Link>
          </div>
        </Reveal>

        <Reveal as="aside" className="decision-panel" delay={180} variant="right">
          <div className="decision-panel-head">
            <div>
              <p className="landing-micro">Live preview</p>
              <h2>School club system overview</h2>
            </div>
            <span>3 roles</span>
          </div>

          <div className="hero-summary-panel">
            <p className="hero-summary-text">
              One landing page that connects student club applications, teacher
              approval, and admin management in a simple flow.
            </p>

            <div className="hero-role-list">
              <div className="hero-role-item">
                <strong>Students</strong>
                <span>Browse clubs and send one request.</span>
              </div>
              <div className="hero-role-item">
                <strong>Teachers</strong>
                <span>Review requests and watch club capacity.</span>
              </div>
              <div className="hero-role-item">
                <strong>Admins</strong>
                <span>Create clubs, assign teachers, and manage setup.</span>
              </div>
            </div>

            <div className="hero-panel-links">
              <Link href="/students" className="hero-panel-link">
                Student page
              </Link>
              <Link href="/teacher" className="hero-panel-link">
                Teacher page
              </Link>
              <Link href="/admin" className="hero-panel-link">
                Admin page
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
