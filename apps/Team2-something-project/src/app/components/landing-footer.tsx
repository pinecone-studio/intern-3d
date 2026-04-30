import Link from 'next/link';

import { footerColumns } from '../landing-data';

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-top">
        {footerColumns.map((column) => (
          <div key={column.title} className="footer-column">
            <h3>{column.title}</h3>
            {column.links.map((link) => (
              <Link key={link.label} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="footer-language">
          <span>English (United States)</span>
          <span>Mongol</span>
        </div>

        <div className="footer-socials">
          <span>X</span>
          <span>Facebook</span>
          <span>Instagram</span>
          <span>YouTube</span>
          <span>LinkedIn</span>
        </div>

        <span className="footer-copy">© Team 2 School Clubs</span>
      </div>
    </footer>
  );
}
