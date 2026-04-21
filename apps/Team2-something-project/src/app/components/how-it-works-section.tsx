import { chatReplies, decisionSteps } from '../landing-data';
import { Reveal } from './reveal';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="info-shell info-shell-light">
      <Reveal className="info-card steps-card" variant="up">
        <p className="landing-micro">How it works</p>
        <h2>Students apply. Teachers review. Admins manage.</h2>
        <p className="section-description">
          The landing page connects the full school club flow from request to
          approval.
        </p>

        <div className="steps-grid">
          {decisionSteps.map((step) => (
            <article key={step.number} className="step-card">
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="info-card chat-card" delay={180} variant="zoom">
        <div className="chat-card-head">
          <div>
            <p className="landing-micro">System status</p>
            <h3>Your club updates, all in one place</h3>
          </div>
          <span className="new-pill">New</span>
        </div>

        <div className="chat-stack">
          {chatReplies.map((reply) => (
            <div key={reply} className="chat-bubble">
              {reply}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
