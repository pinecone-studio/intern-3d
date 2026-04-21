import Link from 'next/link';
import { Reveal } from './reveal';

export function CtaSection() {
  return (
    <section className="cta-section">
      <div className="cta-backdrop" />
      <Reveal className="cta-card" variant="zoom">
        <span className="cta-mark">SC</span>
        <h2>Start using the club system</h2>
        <Link
          href="/admin"
          className="landing-button landing-button-dark cta-button"
        >
          Open admin
        </Link>
        <p className="cta-login-copy">
          Need to review requests? <Link href="/teacher">Open teacher page</Link>
        </p>
        <div className="store-list">
          <span>Student page</span>
          <span>Teacher page</span>
        </div>
      </Reveal>
    </section>
  );
}
