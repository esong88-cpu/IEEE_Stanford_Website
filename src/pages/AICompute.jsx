import PackageArt from '../components/PackageArt'
import {
  aiComputeMeta as meta,
  aiComputeLogos as logos,
  aiComputeProgram,
  aiComputeCommittee,
  aiComputeInfo,
} from '../data/aiComputeData'

// Stands alone (App hides the site nav here). Styles are the "AI Compute (S2S)" block in index.css.

const keynote = aiComputeProgram.find((p) => p.tag === 'Keynote')?.speakers?.[0]

function rowClass({ tag, kind, speakers }) {
  return [
    's2s-row',
    tag && `is-${tag.toLowerCase()}`,
    kind && `is-${kind}`,
    speakers && 'has-more',
  ].filter(Boolean).join(' ')
}

function Face({ name, photo, initials, size = 'sm' }) {
  return photo ? (
    <img className={`s2s-face s2s-face--${size}`} src={photo} alt="" loading="lazy" />
  ) : (
    <span className={`s2s-face s2s-face--${size} s2s-face--initials`} aria-hidden="true">{initials || name[0]}</span>
  )
}

function RowHead(p) {
  const who = p.who || p.speakers?.map((s) => `${s.name}, ${s.org}`).join(' · ')
  return (
    <>
      <span className="s2s-row-time">{p.time}</span>
      <span className="s2s-row-body">
        <span className="s2s-row-title">
          {p.title}
          {p.tag && p.tag !== p.title && <span className="s2s-row-tag">{p.tag}</span>}
        </span>
        {who && <span className="s2s-row-who">{who}</span>}
        {p.panel && (
          <span className="s2s-row-faces">
            {p.panel.map((s) => <Face key={s.name} {...s} />)}
          </span>
        )}
      </span>
      {p.logos && (
        <span className="s2s-row-id">
          {p.logos.map((l) => (
            <span key={l.org} className="s2s-logo"><img src={l.src} alt={l.org} loading="lazy" /></span>
          ))}
        </span>
      )}
      {p.speakers && p.tag !== 'Panel' && (
        <span className="s2s-row-id">
          {p.speakers[0].logo && (
            <span className="s2s-logo"><img src={p.speakers[0].logo} alt={p.speakers[0].org} loading="lazy" /></span>
          )}
          <Face {...p.speakers[0]} />
        </span>
      )}
      {p.speakers && <span className="s2s-row-plus" aria-hidden="true" />}
    </>
  )
}

function ProgramRow(p) {
  if (!p.speakers) {
    return (
      <li className={rowClass(p)}>
        <div className="s2s-row-head"><RowHead {...p} /></div>
      </li>
    )
  }
  return (
    <li className={rowClass(p)}>
      <details>
        <summary className="s2s-row-head"><RowHead {...p} /></summary>
        <div className="s2s-row-more">
          {p.note && <p className="s2s-row-note">{p.note}</p>}
          {p.speakers.map((s) => (
            <div key={s.name} className="s2s-bio">
              <Face {...s} size="lg" />
              <div>
                <p className="s2s-bio-name">{s.name} <span>{s.org}</span></p>
                {s.abstract && <p className="s2s-bio-abstract">{s.abstract}</p>}
                <p>{s.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </details>
    </li>
  )
}

function Lockup({ className = '' }) {
  return (
    <span className={`s2s-lockup ${className}`} aria-label="Stanford IEEE × IEEE CASS × Samsung Semiconductor">
      <span className="s2s-lockup-ieee">
        <img src={logos.stanfordIeee} alt="" />
        <span>Stanford IEEE</span>
      </span>
      <span className="s2s-x" aria-hidden="true">×</span>
      <img src={logos.cass} alt="" className="s2s-lockup-cass" />
      <span className="s2s-x" aria-hidden="true">×</span>
      <span className="s2s-lockup-samsung">
        <img src={logos.samsung} alt="" />
      </span>
    </span>
  )
}

export default function AICompute() {
  return (
    <div className="s2s">
      <header className="s2s-bar">
        <div className="s2s-wrap s2s-bar-inner">
          <Lockup />
          <a className="s2s-cta" href={meta.lumaUrl} target="_blank" rel="noreferrer">Register by {meta.deadlineStr}</a>
        </div>
      </header>

      <section aria-labelledby="s2s-title" className="s2s-hero">
        <div className="s2s-grain" aria-hidden="true" />
        <div className="s2s-wrap s2s-hero-inner">
          <div className="s2s-hero-copy">
            <h1 id="s2s-title" className="s2s-title s2s-reveal" style={{ animationDelay: '.08s' }}>
              AI Compute Orchestration <em>S2S</em>
              <span className="s2s-subtitle">{meta.subtitle}</span>
            </h1>
            {keynote && (
              <p className="s2s-keynote s2s-reveal" style={{ animationDelay: '.12s' }}>
                <span className="s2s-mono-label">Keynote</span> {keynote.name}, {keynote.org}
              </p>
            )}
            <p className="s2s-when s2s-reveal" style={{ animationDelay: '.16s' }}>
              {meta.dateStr}
            </p>
          </div>
          <PackageArt />
        </div>
      </section>

      <section id="program" aria-labelledby="s2s-program-h" className="s2s-program">
        <div className="s2s-wrap">
          <div className="s2s-section-head">
            <h2 id="s2s-program-h" className="s2s-h2">Program</h2>
          </div>
          <ol className="s2s-rows">
            {aiComputeProgram.map((p) => (
              <ProgramRow key={p.time} {...p} />
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="s2s-committee-h" className="s2s-committee">
        <div className="s2s-wrap">
          <div className="s2s-section-head">
            <h2 id="s2s-committee-h" className="s2s-h2">Program Committee <em>&amp;</em> Organizers</h2>
          </div>
          <ul className="s2s-committee-list">
            {aiComputeCommittee.map((c) => (
              <li key={c.name}>
                <span className="s2s-committee-name">{c.name}</span>
                <span className="s2s-committee-role">{c.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="s2s-foot" aria-labelledby="s2s-info-h">
        <div className="s2s-grain" aria-hidden="true" />
        <div className="s2s-wrap s2s-foot-inner">
          <div>
            <div className="s2s-section-head">
              <h2 id="s2s-info-h" className="s2s-h2">Before you <em>come</em></h2>
            </div>
            <ul className="s2s-rows">
              {aiComputeInfo.map((item) => (
                <li key={item.title} className="s2s-row has-more">
                  <details>
                    <summary className="s2s-row-head s2s-info-head">
                      <span className="s2s-row-title">{item.title}</span>
                      <span className="s2s-row-plus" aria-hidden="true" />
                    </summary>
                    <div className="s2s-info-body">
                      {item.body.map((t) => <p key={t}>{t}</p>)}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
          <dl className="s2s-foot-facts">
            <div><dt>Where</dt><dd>{meta.where}</dd></div>
            <div><dt>Parking</dt><dd>{meta.parking}</dd></div>
            <div><dt>Contact</dt><dd><a href={`mailto:${meta.contact}`}>{meta.contact}</a></dd></div>
          </dl>
          <div className="s2s-foot-hosts">
            <div>
              <span className="s2s-mono-label">Hosted by</span>
              <a className="s2s-host" href={import.meta.env.BASE_URL}>
                <img src={logos.stanfordIeee} alt="" className="s2s-host-ieee" />
                <span>Stanford IEEE<small>Student Branch</small></span>
              </a>
            </div>
            <div>
              <span className="s2s-mono-label">Sponsored by</span>
              <span className="s2s-host">
                <img src={logos.cass} alt="" className="s2s-host-cass" />
                <span>IEEE CASS<small>Circuits and Systems Society</small></span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
