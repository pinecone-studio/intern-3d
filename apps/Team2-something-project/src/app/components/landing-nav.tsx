import Link from 'next/link';

import { navItems } from '../landing-data';

export function LandingNav() {
  return (
    <header className="landing-nav">
      <nav className="landing-nav-links" aria-label="Primary">
        {navItems.map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
            className={item === 'Roles' ? 'landing-chip' : undefined}
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="landing-brand">School Clubs</div>

      <div className="landing-nav-actions">
        <Link href="/teacher" className="landing-button landing-button-ghost">
          Log in
        </Link>
        <Link href="/students" className="landing-button landing-button-light">
          Get started
        </Link>
      </div>
    </header>
  );
}
