import { useCases } from '../landing-data';
import { Reveal } from './reveal';

export function UseCasesSection() {
  return (
    <section id="resources" className="groups-section">
      <div className="groups-overlay" />
      <Reveal className="groups-content" variant="up">
        <p className="landing-micro landing-micro-dark">Roles</p>
        <h2>Built for every part of the club system</h2>
        <p className="section-description groups-description">
          Each screen is designed for the role using it most: student, teacher,
          or admin.
        </p>

        <div className="use-case-grid">
          {useCases.map((item) => (
            <article
              key={item.title}
              className={`use-case-card use-case-${item.tone}`}
            >
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
