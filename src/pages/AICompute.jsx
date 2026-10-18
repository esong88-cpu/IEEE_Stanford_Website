import Reveal from '../components/Reveal'
import {
  aiComputeMeta as meta,
  aiComputeProgram,
  aiComputeSpeakers,
  aiComputeCommittee,
  aiComputeVenue,
} from '../data/aiComputeData'

function initials(name) {
  return name
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
}

function ProgramRow({ time, title, who, tag, kind }) {
  const tagClass = tag ? ` conf-program-row--${tag.toLowerCase()}` : ''
  const kindClass = kind ? ` conf-program-row--${kind}` : ''
  return (
    <li className={`conf-program-row${tagClass}${kindClass}`}>
      <span className="conf-program-time">{time}</span>
      <div className="conf-program-body">
        <div className="conf-program-title">
          <span>{title}</span>
          {tag && <span className={`conf-tag conf-tag--${tag.toLowerCase()}`}>{tag}</span>}
        </div>
        {who && <p className="conf-program-who">{who}</p>}
      </div>
    </li>
  )
}

function SpeakerCard({ name, role, org, photo, tba, tag, talk, abstract, bio, index }) {
  return (
    <Reveal delay={index * 40}>
      <article className="conf-speaker">
        <div className="conf-speaker-photo">
          {photo ? (
            <img src={photo} alt={name} loading="lazy" />
          ) : (
            <span aria-hidden="true">{tba ? 'TBA' : initials(name)}</span>
          )}
        </div>
        {tag && <span className={`conf-tag conf-tag--${tag.toLowerCase()}`}>{tag}</span>}
        <h3 className="conf-speaker-name">{name}</h3>
        <p className="conf-speaker-role">{role}</p>
        <p className="conf-speaker-org">{org}</p>
        {talk && <p className="conf-speaker-talk">“{talk}”</p>}
        {(abstract || bio) && (
          <details className="conf-speaker-more">
            <summary>{abstract ? 'Abstract & bio' : 'Bio'}</summary>
            {abstract && <p>{abstract}</p>}
            {bio && <p>{bio}</p>}
          </details>
        )}
      </article>
    </Reveal>
  )
}

export default function AICompute() {
  return (
    <section className="section page-content conf-page">
      <div className="container container-wide">
        <Reveal>
          <header className="page-header conf-hero">
            <p className="section-kicker">{meta.kicker}</p>
            <h1 className="page-title">{meta.title}</h1>
            <p className="conf-subtitle">{meta.subtitle}</p>
            <p className="page-description">{meta.description}</p>
          </header>
        </Reveal>

        <dl className="conf-facts">
          <div><dt>Date</dt><dd>{meta.dateStr}</dd></div>
          <div><dt>Time</dt><dd>{meta.timeStr}</dd></div>
          <div><dt>Where</dt><dd>{meta.where}</dd></div>
        </dl>

        <div className="btn-row conf-actions">
          <a href={meta.lumaUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
            Register on Luma ↗
          </a>
          <span className="conf-seats">{meta.seats}</span>
        </div>

        <dl className="conf-credits">
          <div><dt>Hosted by</dt><dd>{meta.hostedBy}</dd></div>
          <div><dt>Sponsored by</dt><dd>{meta.sponsoredBy}</dd></div>
          <div><dt>Speakers from</dt><dd>{meta.speakersFrom}</dd></div>
        </dl>

        <div className="page-block">
          <h2 className="page-block-title">Program</h2>
          <p className="conf-block-desc">Friday, November 13 in Allen 101X. Check-in and breakfast from 8:00.</p>
          <ol className="conf-program">
            {aiComputeProgram.map((p) => (
              <ProgramRow key={p.time} {...p} />
            ))}
          </ol>
        </div>

        <div className="page-block">
          <h2 className="page-block-title">Speakers</h2>
          <p className="conf-block-desc">
            Engineers and researchers from across the stack, from number formats and memory to packaging and system software.
          </p>
          <div className="conf-speaker-grid">
            {aiComputeSpeakers.map((s, i) => (
              <SpeakerCard key={`${s.name}-${s.org}`} {...s} index={i} />
            ))}
          </div>
        </div>

        <div className="page-block">
          <h2 className="page-block-title">Program committee &amp; organizers</h2>
          <ul className="conf-committee">
            {aiComputeCommittee.map((c) => (
              <li key={c.name}>
                <span className="conf-committee-name">{c.name}</span>
                <span className="conf-committee-role">{c.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="page-block">
          <div className="contact-grid">
            <div className="contact-card">
              <h3>Save a seat</h3>
              <p>Free, with breakfast and lunch. {meta.seats}</p>
              <a href={meta.lumaUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
                Register on Luma ↗
              </a>
            </div>
            <div className="contact-card">
              <h3>Venue</h3>
              <dl className="conf-venue">
                {aiComputeVenue.map((v) => (
                  <div key={v.label}>
                    <dt>{v.label}</dt>
                    <dd>{v.href ? <a href={v.href}>{v.value}</a> : v.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
