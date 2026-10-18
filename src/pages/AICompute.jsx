import PackageArt from '../components/PackageArt'
import {
  aiComputeMeta as meta,
  aiComputeLogos as logos,
  aiComputeProgram,
  aiComputeSpeakers,
  aiComputeCommittee,
  aiComputeVenue,
} from '../data/aiComputeData'

// Mirrors the AI Compute design canvas; styles are the "AI Compute (S2S)" block in index.css.

const SPEAKER_TAG_BG = { Keynote: '#8C1515', Panel: '#9A5A2E' }

function programRowClass({ tag, kind }) {
  return ['s2s-prog-row', tag && `is-${tag.toLowerCase()}`, kind && `is-${kind}`].filter(Boolean).join(' ')
}

function ProgramRow(p) {
  return (
    <li className={programRowClass(p)}>
      <span className="s2s-prog-time">{p.time}</span>
      <span className="s2s-prog-dot" aria-hidden="true" />
      <div className="s2s-prog-body">
        <div className="s2s-prog-title-line">
          <span className="s2s-prog-title">{p.title}</span>
          {p.tag && <span className="s2s-prog-tag">{p.tag}</span>}
        </div>
        {p.who && <span className="s2s-prog-who">{p.who}</span>}
      </div>
    </li>
  )
}

function SpeakerCard(s) {
  return (
    <li className="s2s-spk">
      <div className="s2s-spk-photo">
        {s.photo ? (
          <img className="s2s-portrait" src={s.photo} alt={s.name} loading="lazy" style={{ objectPosition: s.pos || 'center' }} />
        ) : s.tba ? (
          <div className="s2s-spk-tba" aria-hidden="true">
            <div className="s2s-spk-diamond"><div className="s2s-iri" /></div>
            <span>{s.mark || s.org}</span>
          </div>
        ) : (
          <div className="s2s-spk-initials" aria-hidden="true">{s.initials}</div>
        )}
        {s.tag && (
          <span className="s2s-spk-tag" style={{ background: SPEAKER_TAG_BG[s.tag] || '#1A1714' }}>{s.tag}</span>
        )}
      </div>
      <div className="s2s-spk-id">
        <h3>{s.name}</h3>
        <p className="s2s-spk-role">{s.role}</p>
        <p className="s2s-spk-org">{s.org}</p>
      </div>
      {s.talk && <p className="s2s-spk-talk">“{s.talk}”</p>}
      {s.bio && (
        <details className="s2s-spk-more">
          <summary>
            {s.abstract ? 'Abstract & bio' : 'Bio'} <span className="s2s-plus" aria-hidden="true">+</span>
          </summary>
          {s.abstract && <p className="s2s-spk-abstract">{s.abstract}</p>}
          <p>{s.bio}</p>
        </details>
      )}
    </li>
  )
}

export default function AICompute() {
  return (
    <div className="s2s">
      <div className="s2s-bar">
        <div className="s2s-wrap s2s-bar-inner">
          <span className="s2s-lockup" aria-label="Stanford IEEE × IEEE CASS × Samsung Semiconductor">
            <span className="s2s-lockup-ieee">
              <img src={logos.stanfordIeee} alt="" />
              <span>Stanford IEEE</span>
            </span>
            <span className="s2s-x" aria-hidden="true">×</span>
            <img src={logos.cass} alt="" className="s2s-lockup-cass" />
            <span className="s2s-x" aria-hidden="true">×</span>
            <span className="s2s-lockup-samsung">
              <img src={logos.samsung} alt="" />
              <span className="s2s-semi">Semiconductor</span>
            </span>
          </span>
          <nav aria-label="Symposium" className="s2s-bar-nav">
            <span className="s2s-navlinks">
              <a href="#program">Program</a>
              <a href="#speakers">Speakers</a>
              <a href="#details">Venue</a>
            </span>
            <a className="s2s-cta s2s-topreg" href={meta.lumaUrl} target="_blank" rel="noreferrer">Register ↗</a>
          </nav>
        </div>
      </div>

      <section aria-labelledby="s2s-title" className="s2s-hero">
        <div className="s2s-grain" aria-hidden="true" />
        <div className="s2s-wrap s2s-hero-inner">
          <div className="s2s-hero-copy">
            <div className="s2s-kicker s2s-reveal">
              <span className="s2s-iri s2s-kicker-mark" aria-hidden="true" />
              <span>{meta.kicker}</span>
            </div>
            <div className="s2s-reveal s2s-title-block" style={{ animationDelay: '.08s' }}>
              <h1 id="s2s-title" className="s2s-title">
                AI Compute Orchestration <em>S2S</em>
              </h1>
              <p className="s2s-subtitle">{meta.subtitle}</p>
            </div>
            <p className="s2s-reveal s2s-lede" style={{ animationDelay: '.16s' }}>{meta.description}</p>
            <dl className="s2s-reveal s2s-facts" style={{ animationDelay: '.22s' }}>
              <div><dt>Date</dt><dd>{meta.dateStr}</dd></div>
              <div><dt>Time</dt><dd>{meta.timeStr}</dd></div>
              <div><dt>Where</dt><dd>{meta.where}</dd></div>
            </dl>
            <div className="s2s-reveal s2s-hero-cta" style={{ animationDelay: '.28s' }}>
              <a className="s2s-cta s2s-cta--lg" href={meta.lumaUrl} target="_blank" rel="noreferrer">Register on Luma</a>
              <span className="s2s-mono-note">{meta.seatsShort}</span>
            </div>
          </div>
          <PackageArt />
        </div>

        <div className="s2s-wrap s2s-hosts">
          <div className="s2s-host">
            <span className="s2s-mono-label">Hosted by</span>
            <span className="s2s-host-id">
              <img src={logos.stanfordIeee} alt="" className="s2s-host-ieee" />
              <span className="s2s-host-name">Stanford IEEE<span>Student Branch</span></span>
            </span>
          </div>
          <div className="s2s-host">
            <span className="s2s-mono-label">Sponsored by</span>
            <span className="s2s-host-id">
              <img src={logos.cass} alt="" className="s2s-host-cass" />
              <span className="s2s-host-name">IEEE CASS<span>Circuits and Systems Society</span></span>
            </span>
          </div>
          <div className="s2s-host s2s-host--wide">
            <span className="s2s-mono-label">Speakers from</span>
            <span className="s2s-host-orgs">Samsung, Stanford, Micron, Amazon <em>&amp;</em> Anthropic</span>
          </div>
        </div>
      </section>

      <section id="program" aria-labelledby="s2s-program-h" className="s2s-program">
        <div className="s2s-wrap s2s-program-inner">
          <div className="s2s-program-aside">
            <span className="s2s-eyebrow">01 — Program</span>
            <h2 id="s2s-program-h" className="s2s-h2">One morning, <em>the whole stack.</em></h2>
            <p className="s2s-aside-note">Friday, November 13 in Allen 101X. Check-in and breakfast from 8:00.</p>
            <div className="s2s-legend">
              <span><span className="s2s-iri s2s-legend-dot" aria-hidden="true" />Keynote</span>
              <span><span className="s2s-legend-dot" style={{ background: '#D08A55' }} aria-hidden="true" />Panel</span>
              <span><span className="s2s-legend-dot" style={{ background: '#E06A5F' }} aria-hidden="true" />Talk</span>
            </div>
          </div>
          <ol className="s2s-prog">
            {aiComputeProgram.map((p) => (
              <ProgramRow key={p.time} {...p} />
            ))}
          </ol>
        </div>
      </section>

      <section id="speakers" aria-labelledby="s2s-speakers-h" className="s2s-paper">
        <div className="s2s-wrap s2s-speakers">
          <div className="s2s-speakers-head">
            <div className="s2s-heading">
              <span className="s2s-eyebrow s2s-eyebrow--dark">02 — Speakers</span>
              <h2 id="s2s-speakers-h" className="s2s-h2">The people <em>building it.</em></h2>
            </div>
            <p className="s2s-speakers-note">
              Engineers and researchers from across the stack, from number formats and memory to packaging and system software.
            </p>
          </div>
          <ul className="s2s-spk-grid">
            {aiComputeSpeakers.map((s) => (
              <SpeakerCard key={`${s.name}-${s.org}`} {...s} />
            ))}
          </ul>
        </div>

        <div id="committee" className="s2s-wrap s2s-committee">
          <div className="s2s-committee-head">
            <span className="s2s-eyebrow s2s-eyebrow--dark">03 — Committee</span>
            <h2>Program committee <em>&amp;</em> organizers</h2>
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

      <section aria-labelledby="s2s-reg-h" className="s2s-register">
        <div className="s2s-grain" aria-hidden="true" />
        <div className="s2s-wafer-art" aria-hidden="true" />
        <div className="s2s-wrap s2s-register-inner">
          <span className="s2s-register-when">Friday, November 13 · Allen 101X</span>
          <h2 id="s2s-reg-h">Save a seat.</h2>
          <p>Free, with breakfast and lunch. {meta.seats}</p>
          <a className="s2s-cta-paper" href={meta.lumaUrl} target="_blank" rel="noreferrer">Register on Luma ↗</a>
        </div>
      </section>

      <section id="details" aria-label="Details" className="s2s-wrap s2s-details">
        <dl>
          {aiComputeVenue.map((v) => (
            <div key={v.label}>
              <dt>{v.label}</dt>
              <dd>{v.href ? <a href={v.href}>{v.value}</a> : v.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="s2s-credits">
        <div className="s2s-wrap s2s-credits-inner">
          <span className="s2s-credits-line">
            <img src={logos.stanfordIeee} alt="" />
            <span>Stanford IEEE Student Branch × IEEE Circuits and Systems Society × Samsung Semiconductor</span>
          </span>
          <span className="s2s-credits-url">{meta.footerUrl}</span>
        </div>
      </div>
    </div>
  )
}
