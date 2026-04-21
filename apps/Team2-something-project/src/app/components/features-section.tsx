import { featureColumns } from '../landing-data';
import { Reveal } from './reveal';

export function FeaturesSection() {
  return (
    <section id="features" className="dark-feature-section">
      <Reveal className="dark-feature-inner" variant="up">
        <p className="landing-micro">Features</p>
        <h2>Turning club interest into clear action</h2>
        <p className="dark-lead">
          Instead of messy paper lists or unclear messages, the system gives
          each role one clear job.
        </p>

        <div className="feature-columns">
          {featureColumns.map((item) => (
            <article key={item.title} className="feature-column">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
