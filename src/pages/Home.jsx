import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ParticleCanvas from '../components/ParticleCanvas'
import PackageArt from '../components/PackageArt'
import Reveal from '../components/Reveal'
import StatCounter from '../components/StatCounter'
import { useLumaEvents } from '../data/lumaEvents'
import { chapters, branchCalendarUrl } from '../data/chaptersPageData'
import { aiComputeMeta, aiComputeLogos } from '../data/aiComputeData'
import { hostedCompaniesData, pressLinksData } from '../data/eventsPageData'
import {
  homeTagline,
  pastSpeakers,
  speakerSpotlight,
  homeStats,
  facultyAdvisors,
  partnerOffers,
  BRANCH_EMAIL,
  MAILING_LIST_URL,
} from '../data/homeData'

const EVENT_PREVIEW_COUNT = 5
const SYMPOSIUM_ACCENT = '#c9b6f2'
const PARTNER_MAILTO = `mailto:${BRANCH_EMAIL}?subject=${encodeURIComponent('Speaking at Stanford IEEE')}`

const TIME_ZONE = 'America/Los_Angeles'
const monthDayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: '2-digit' })
const weekdayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' })
const weekdayTimeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

function isSymposium(ev) {
  return ev.href === aiComputeMeta.lumaUrl
}

function eventTag(ev) {
  if (ev.chapters?.length) return { label: ev.chapters[0].short, color: ev.chapters[0].accent }
  if (isSymposium(ev)) return { label: 'Featured', color: SYMPOSIUM_ACCENT }
  return null
}

function EventRow({ ev }) {
  const tag = eventTag(ev)
  const meta = [weekdayTimeFmt.format(ev.date).replace(',', ''), ev.location].filter(Boolean).join(' · ')
  const content = (
    <>
      <span className="home-row-date">{monthDayFmt.format(ev.date)}</span>
      <span className="home-row-main">
        <span className="home-row-title-line">
          <span
            className={`home-row-dot${tag ? ' home-row-dot--lit' : ''}`}
            style={tag ? { '--dot': tag.color } : undefined}
            aria-hidden="true"
          />
          <span className="home-row-title">{ev.title}</span>
        </span>
        {meta && <span className="home-row-meta">{meta}</span>}
      </span>
      <span className="home-row-tag" style={tag ? { color: tag.color } : undefined}>
        {tag ? tag.label : 'Branch'}
      </span>
      <span className="home-row-arrow" aria-hidden="true">{ev.href ? '↗' : '→'}</span>
    </>
  )
  return ev.href ? (
    <a href={ev.href} target="_blank" rel="noreferrer" className="home-row">{content}</a>
  ) : (
    <Link to={`/event/${ev.id}`} className="home-row">{content}</Link>
  )
}

function NextTicker({ ev }) {
  const label = isSymposium(ev) ? 'Featured' : 'Next'
  const content = (
    <>
      <span className="home-ticker-dot" aria-hidden="true" />
      <span className="home-ticker-when">
        {label} · {weekdayFmt.format(ev.date)} {monthDayFmt.format(ev.date)}
      </span>
      <span className="home-ticker-title">{ev.title}</span>
      <span className="home-ticker-arrow" aria-hidden="true">→</span>
    </>
  )
  const props = { className: 'home-ticker hero-rise', style: { '--d': '0.6s' } }
  return ev.href ? (
    <a href={ev.href} target="_blank" rel="noreferrer" {...props}>{content}</a>
  ) : (
    <Link to={`/event/${ev.id}`} {...props}>{content}</Link>
  )
}

function SectionLabel({ index, children }) {
  return (
    <span className="home-label">
      {index} <span className="home-label-sep">/</span> {children}
    </span>
  )
}

function daysUntil(date) {
  return Math.ceil((date - new Date()) / 86400000)
}

export default function Home() {
  const heroRef = useRef(null)
  const luma = useLumaEvents()
  const [filter, setFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const symposiumDays = daysUntil(aiComputeMeta.startsAt)
  const showSymposium = symposiumDays >= 0
  // The symposium is pinned above everything else while it's upcoming.
  const lumaUpcoming = luma.status === 'ready' ? luma.upcoming : []
  const upcoming = showSymposium
    ? [...lumaUpcoming.filter(isSymposium), ...lumaUpcoming.filter((ev) => !isSymposium(ev))]
    : lumaUpcoming
  const next = upcoming[0]
  const matching = upcoming.filter((ev) => filter === 'all' || ev.chapters?.some((c) => c.id === filter))
  const visible = showAll ? matching : matching.slice(0, EVENT_PREVIEW_COUNT)
  const chapterCounts = Object.fromEntries(
    chapters.map((ch) => [ch.id, upcoming.filter((ev) => ev.chapters?.some((c) => c.id === ch.id)).length])
  )

  return (
    <div className="home">
      <section className="home-hero" ref={heroRef}>
        <ParticleCanvas targetRef={heroRef} />
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="home-hero-vignette" aria-hidden="true" />

        <div className="home-hero-inner">
          <p className="home-eyebrow hero-rise" style={{ '--d': '0.05s' }}>
            Stanford IEEE Student Branch <span className="home-accent">·</span> Est. 2001
          </p>
          <h1 className="home-hero-title hero-rise" style={{ '--d': '0.15s' }}>
            Hardware,<br />software, <span className="home-dim">and systems.</span>
          </h1>
          <p className="home-hero-sub hero-rise" style={{ '--d': '0.28s' }}>{homeTagline}</p>
          <div className="home-btn-row hero-rise" style={{ '--d': '0.4s' }}>
            <a href="#upcoming" className="home-btn home-btn--primary">Upcoming events</a>
            <a href="#partner" className="home-btn home-btn--ghost">Speak or partner →</a>
          </div>
        </div>

        {next && <NextTicker ev={next} />}
      </section>

      {showSymposium && (
        <section className="s2s home-feature" aria-labelledby="home-feature-title">
          <div className="s2s-grain" aria-hidden="true" />
          <div className="s2s-wrap s2s-hero-inner home-feature-inner">
            <div className="s2s-hero-copy">
              <div className="home-feature-meta">
                <span className="s2s-kicker">
                  <span className="s2s-iri s2s-kicker-mark" aria-hidden="true" />
                  <span>Featured · Inaugural symposium</span>
                </span>
                <span className="home-countdown">{symposiumDays === 0 ? 'Today' : `T–${symposiumDays} days`}</span>
              </div>
              <div className="s2s-title-block">
                <h2 id="home-feature-title" className="s2s-title">
                  AI Compute Orchestration <em>S2S</em>
                </h2>
                <p className="s2s-subtitle">{aiComputeMeta.subtitle}</p>
              </div>
              <p className="s2s-lede">{aiComputeMeta.description}</p>
              <dl className="s2s-facts">
                <div><dt>Date</dt><dd>{aiComputeMeta.dateStr}</dd></div>
                <div><dt>Time</dt><dd>{aiComputeMeta.timeStr}</dd></div>
                <div><dt>Where</dt><dd>{aiComputeMeta.where}</dd></div>
              </dl>
              <div className="s2s-hero-cta">
                <a className="s2s-cta s2s-cta--lg" href={aiComputeMeta.lumaUrl} target="_blank" rel="noreferrer">
                  Register on Luma
                </a>
                <Link to={aiComputeMeta.path} className="home-feature-link">Program &amp; speakers →</Link>
              </div>
              <div className="home-feature-hosts">
                <img src={aiComputeLogos.stanfordIeee} alt="Stanford IEEE" className="home-feature-ieee" />
                <span className="s2s-x" aria-hidden="true">×</span>
                <img src={aiComputeLogos.cass} alt="IEEE Circuits and Systems Society" className="home-feature-cass" />
                <span className="s2s-x" aria-hidden="true">×</span>
                <img src={aiComputeLogos.samsung} alt="Samsung" className="home-feature-samsung" />
              </div>
            </div>
            <PackageArt />
          </div>
        </section>
      )}

      <section className="home-roster" aria-label="Past speakers">
        <div className="home-container home-roster-inner">
          <span className="home-mono-label">Past speakers</span>
          <ul className="home-roster-list">
            {pastSpeakers.map((s) => (
              <li key={s.name}>
                {s.name} <span className="home-roster-org">{s.org}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="upcoming" className="home-section">
        <div className="home-container">
          <div className="home-section-head">
            <div className="home-heading">
              <SectionLabel index="01">Events</SectionLabel>
              <h2 className="home-h2">Upcoming</h2>
              <p className="home-lede">Free, open to all students, no membership needed. RSVP on Luma.</p>
            </div>
            <div className="home-filters" role="group" aria-label="Filter events by chapter">
              {[{ id: 'all', short: 'All', accent: '#ffffff' }, ...chapters].map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  className={`home-filter${filter === ch.id ? ' is-active' : ''}`}
                  style={{ '--accent': ch.accent }}
                  aria-pressed={filter === ch.id}
                  onClick={() => {
                    setFilter(ch.id)
                    setShowAll(false)
                  }}
                >
                  <span className="home-filter-dot" aria-hidden="true" />
                  {ch.short}
                </button>
              ))}
            </div>
          </div>

          <div className="home-rows">
            {luma.status === 'loading' && <p className="home-rows-note">Loading events…</p>}
            {luma.status === 'error' && (
              <p className="home-rows-note">
                Couldn’t load events right now. See the{' '}
                <a href={branchCalendarUrl} target="_blank" rel="noreferrer">Luma calendar</a>.
              </p>
            )}
            {luma.status === 'ready' && matching.length === 0 && (
              <p className="home-rows-note">Nothing scheduled for this chapter yet.</p>
            )}
            {visible.map((ev) => (
              <EventRow key={ev.id} ev={ev} />
            ))}
            {matching.length > EVENT_PREVIEW_COUNT && (
              <button type="button" className="home-more" onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Show fewer ↑' : `Show all ${matching.length} events ↓`}
              </button>
            )}
          </div>

          <div className="home-links">
            <a href={branchCalendarUrl} target="_blank" rel="noreferrer" className="home-link">Subscribe on Luma ↗</a>
            <Link to="/events" className="home-link">Past events →</Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container">
          <div className="home-heading">
            <SectionLabel index="02">Chapters</SectionLabel>
            <h2 className="home-h2">Find your field</h2>
            <p className="home-lede">Smaller groups inside the branch, each tied to an IEEE technical society.</p>
          </div>
          <div className="home-tiles">
            {chapters.map((ch, i) => (
              <Reveal key={ch.id} delay={i * 60}>
                <Link to={ch.chapterPage.path} className="home-tile" style={{ '--accent': ch.accent }}>
                  <span className="home-tile-top">
                    <span className="home-tile-num">0{i + 1}</span>
                    {chapterCounts[ch.id] > 0 && (
                      <span className="home-tile-count">{chapterCounts[ch.id]} upcoming</span>
                    )}
                  </span>
                  <span className="home-tile-body">
                    <span className="home-tile-short">{ch.short}</span>
                    <span className="home-tile-name">{ch.summaryTitle.split('—')[1]?.trim()}</span>
                    <span className="home-tile-go">Meet the chair →</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--rule">
        <div className="home-container">
          <div className="home-section-head">
            <div className="home-heading">
              <SectionLabel index="03">Speakers</SectionLabel>
              <h2 className="home-h2">In the room</h2>
            </div>
            <Link to="/events" className="home-link">Event archive →</Link>
          </div>
          <div className="home-spotlight">
            {speakerSpotlight.map((sp, i) => (
              <Reveal key={sp.eventId} delay={i * 80}>
                <Link to={`/event/${sp.eventId}`} className="home-photo">
                  <img src={sp.image} alt={`${sp.name} speaking at Stanford IEEE`} loading="lazy" />
                  <span className="home-photo-caption">
                    <span className="home-photo-name">{sp.name}</span>
                    <span className="home-photo-meta">{sp.meta}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="home-proof">
            <div className="home-proof-col">
              <span className="home-mono-label">In the Stanford Daily</span>
              {pressLinksData.map((item) => (
                <a key={item.id} href={item.href} target="_blank" rel="noreferrer" className="home-press">
                  “{item.title}” ↗
                </a>
              ))}
            </div>
            <div className="home-proof-col">
              <span className="home-mono-label">Companies we’ve hosted</span>
              <ul className="home-companies">
                {hostedCompaniesData.map(({ name }) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="partner" className="home-section home-partner">
        <div className="home-container home-partner-inner">
          <div className="home-partner-pitch">
            <SectionLabel index="04">Partner with us</SectionLabel>
            <h2 className="home-h2">Bring your work to Stanford engineers.</h2>
            <p className="home-lede home-lede--lg">
              We host founders, executives and researchers, and take care of the room, the audience and the logistics.
            </p>
            <div className="home-stats">
              {homeStats.map((s) => (
                <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>
            <p className="home-advisors">
              <span className="home-mono-label">Faculty advisors</span>
              <span>{facultyAdvisors.join(' · ')}</span>
            </p>
            <div className="home-btn-row home-btn-row--start">
              <a href={PARTNER_MAILTO} className="home-btn home-btn--primary">Email the team</a>
              <Link to="/team" className="home-btn home-btn--ghost">Meet the officers</Link>
            </div>
          </div>
          <ol className="home-offers">
            {partnerOffers.map((o, i) => (
              <li key={o.title}>
                <a href={PARTNER_MAILTO} className="home-offer">
                  <span className="home-offer-num">0{i + 1}</span>
                  <span className="home-offer-body">
                    <span className="home-offer-title">{o.title}</span>
                    <span className="home-offer-text">{o.body}</span>
                  </span>
                  <span className="home-offer-arrow" aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-join">
        <div className="home-grid-bg" aria-hidden="true" />
        <div className="home-join-glow" aria-hidden="true" />
        <div className="home-container home-join-inner">
          <div className="home-heading home-heading--center">
            <SectionLabel index="05">Get involved</SectionLabel>
            <h2 className="home-h2 home-h2--xl">Build with us.</h2>
          </div>
          <div className="home-steps">
            <Link to="/events" className="home-step">
              <span className="home-step-num">01</span>
              <span className="home-step-title">Show up</span>
              <span className="home-step-text">Every event is free. No membership needed.</span>
            </Link>
            <a href={MAILING_LIST_URL} target="_blank" rel="noreferrer" className="home-step">
              <span className="home-step-num">02</span>
              <span className="home-step-title">Join the mailing list</span>
              <span className="home-step-text">Hear about new events first, plus the Luma calendar.</span>
            </a>
            <Link to="/chapters" className="home-step">
              <span className="home-step-num">03</span>
              <span className="home-step-title">Join a chapter</span>
              <span className="home-step-text">Pick MTT-S, PES, EDS or PELS and meet the chair.</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
