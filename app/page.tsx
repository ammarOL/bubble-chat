import Image from "next/image";

const insightCards = [
  "Book the morning slot before the calendar fills.",
  "The supplier note is under the kitchen remodel thread.",
  "You decided to pause the side project until July.",
];

const comparisonRows = [
  ["Self chat", "Fast capture", "Painful recovery"],
  ["Notes apps", "Organized folders", "Too much filing"],
  ["Bubbles", "Fast capture", "Ask and cite"],
];

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Primary">
        <a className="landing-brand" href="#top" aria-label="Bubbles home">
          <span className="brand-mark" aria-hidden="true" />
          bubbles
        </a>
        <div className="landing-nav-links">
          <a href="#memory">Memory</a>
          <a href="#privacy">Privacy</a>
          <a href="#comparison">Compare</a>
        </div>
        <a className="landing-cta small" href="/app">
          Try Bubbles
        </a>
      </nav>

      <section className="landing-hero" id="top">
        <div className="hero-copy">
          <p className="landing-eyebrow">Private memory app</p>
          <h1>Save thoughts. Ask them back.</h1>
          <p>
            Bubbles turns scattered self messages into a searchable memory you
            can question later.
          </p>
          <div className="hero-actions">
            <a className="landing-cta" href="/app">
              Try Bubbles
            </a>
            <a className="landing-link" href="#workflow">
              See how it works
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-label="Bubbles product preview">
          <Image
            alt="Laptop and phone showing a clean memory app interface"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 52vw"
            src="/landing-hero.png"
          />
        </div>
      </section>

      <section className="proof-strip" aria-label="What Bubbles replaces">
        <p>Built for the notes you currently send to yourself.</p>
        <div>
          <span>thoughts</span>
          <span>decisions</span>
          <span>reminders</span>
          <span>advice</span>
        </div>
      </section>

      <section className="problem-section">
        <div className="section-copy">
          <h2>Self-chat is fast until you need the answer.</h2>
          <p>
            The capture habit works because it is low friction. The recovery
            habit fails because every search becomes a scroll.
          </p>
        </div>
        <div className="problem-stack" aria-label="Problems with self-chat">
          <article>
            <span>Mix</span>
            <h3>Mixed context</h3>
            <p>Shopping notes, work decisions, and advice collapse into one log.</p>
          </article>
          <article>
            <span>Find</span>
            <h3>Weak recall</h3>
            <p>You remember the feeling, not the exact phrase you need.</p>
          </article>
          <article>
            <span>Trust</span>
            <h3>No citations</h3>
            <p>Even when you find something, trust is still manual.</p>
          </article>
        </div>
      </section>

      <section className="demo-section" id="demo">
        <div className="demo-panel">
          <div className="demo-image">
            <Image
              alt="Desk with notes, phone, and laptop for capturing scattered thoughts"
              fill
              sizes="(max-width: 640px) 100vw, 44vw"
              src="https://picsum.photos/seed/bubbles-capture-desk/980/1080"
            />
          </div>
          <div className="demo-insight" aria-label="Ask Memory preview">
            <h2>Ask Memory answers from what you saved.</h2>
            <p className="demo-question">
              What do I need to remember for the demo?
            </p>
            <div className="answer-list">
              {insightCards.map((card) => (
                <article key={card}>{card}</article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-intro">
          <h2>Capture stays instant. Retrieval gets deliberate.</h2>
        </div>
        <div className="workflow-rail">
          <article>
            <span>1</span>
            <h3>Drop the thought</h3>
            <p>No folder, title, tag, or second screen.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Ask a real question</h3>
            <p>Use the words you remember, not the words you wrote.</p>
          </article>
          <article>
            <span>3</span>
            <h3>Check the source</h3>
            <p>Answers stay grounded in the bubbles that matched.</p>
          </article>
        </div>
      </section>

      <section className="privacy-section" id="privacy">
        <div className="privacy-image">
          <Image
            alt="Quiet desk with notebook and phone for private note capture"
            fill
            sizes="(max-width: 640px) 100vw, 42vw"
            src="https://picsum.photos/seed/bubbles-private-notes/960/1080"
          />
        </div>
        <div className="privacy-copy">
          <h2>Your memory should not feel like a feed.</h2>
          <p>
            Bubbles keeps capture local-first and sends only selected context
            when you ask your provider a question.
          </p>
          <ul>
            <li>Browser saved bubbles</li>
            <li>Bring your own provider key</li>
            <li>Export without API keys</li>
          </ul>
        </div>
      </section>

      <section className="provider-section" id="memory">
        <div className="provider-grid">
          <div className="provider-lead">
            <h2>Choose the model. Keep the habit.</h2>
            <p>
              Settings supports OpenAI, Groq, and Gemini without turning the app
              into a control panel.
            </p>
          </div>
          <article>
            <h3>OpenAI</h3>
            <p>For polished synthesis across longer memory trails.</p>
          </article>
          <article>
            <h3>Groq</h3>
            <p>For fast answers when latency matters.</p>
          </article>
          <article>
            <h3>Gemini</h3>
            <p>For a simple Google key path and broad recall.</p>
          </article>
        </div>
      </section>

      <section className="comparison-section" id="comparison">
        <div className="comparison-copy">
          <h2>Less organization. More recovery.</h2>
          <p>
            Bubbles does not try to become your project system. It improves the
            place where loose thoughts already land.
          </p>
        </div>
        <div className="comparison-table" aria-label="Comparison table">
          {comparisonRows.map(([tool, strength, tradeoff]) => (
            <div key={tool} className={tool === "Bubbles" ? "is-bubbles" : ""}>
              <strong>{tool}</strong>
              <span>{strength}</span>
              <span>{tradeoff}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="quote-section">
        <div className="quote-image">
          <Image
            alt="Person writing a short personal note at a tidy workstation"
            fill
            sizes="(max-width: 640px) 100vw, 44vw"
            src="https://picsum.photos/seed/bubbles-writing-memory/920/680"
          />
        </div>
        <blockquote>
          <p>
            “The point is not to write better notes. The point is to stop losing
            the notes you already write.”
          </p>
          <cite>Designed for the self-chat habit</cite>
        </blockquote>
      </section>

      <section className="final-section">
        <div>
          <h2>Start with one thought.</h2>
          <p>
            Save the thing you would have sent yourself. Ask for it when the
            moment comes back.
          </p>
        </div>
        <a className="landing-cta" href="/app">
          Try Bubbles
        </a>
      </section>
    </main>
  );
}
