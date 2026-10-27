import { useState } from 'react'
import { Link } from 'react-router-dom'
import UpcomingCard from '../components/UpcomingCard'
import {
  pastHighlightData,
  featuredEventsData,
  pressLinksData,
} from '../data/eventsPageData'
import { useLumaEvents } from '../data/lumaEvents'
import PastHighlightCard from '../components/PastHighlightCard'
import FeaturedHighlightCard from '../components/FeaturedHighlightCard'
import { PageHeader } from '../components/Section'
import { eventsArchiveData } from '../data/eventsArchiveData'
import { aiComputeMeta } from '../data/aiComputeData'

const RECENT_PREVIEW_COUNT = 8

export default function Events() {
  const luma = useLumaEvents()
  const [showAllRecent, setShowAllRecent] = useState(false)

  // Upcoming and Recent are hidden if Luma is unreachable or has nothing to show.
  const upcoming = luma.status === 'ready' ? luma.upcoming : []
  const recent = luma.status === 'ready' ? luma.recent : []
  const visibleRecent = showAllRecent ? recent : recent.slice(0, RECENT_PREVIEW_COUNT)

  return (
    <section className="section page-content">
      <div className="container container-wide">
        <PageHeader
          kicker="Events"
          title="IEEE Stanford events."
          description="Talks, fireside chats, and recruiting sessions with industry leaders and researchers."
        />

        <Link to={aiComputeMeta.path} className="conf-callout">
          <span className="conf-callout-kicker">Symposium · {aiComputeMeta.dateStr}</span>
          <span className="conf-callout-title">
            AI Compute Orchestration <em>S2S</em>
            <span className="conf-callout-sub">{aiComputeMeta.subtitle}</span>
          </span>
          <span className="conf-callout-desc">
            {aiComputeMeta.description} {aiComputeMeta.where}.
          </span>
          <span className="conf-callout-cta">Program, speakers &amp; registration →</span>
        </Link>

        {/* Static site in public/urtc, so a full page load rather than a router link */}
        <a href={`${import.meta.env.BASE_URL}urtc/index.html`} className="conf-callout conf-callout--urtc">
          <span className="conf-callout-kicker">Conference · Spring 2027</span>
          <span className="conf-callout-title">
            Stanford URTC <em>2027</em>
            <span className="conf-callout-sub">Undergraduate Research Technology Conference</span>
          </span>
          <span className="conf-callout-desc">
            A one-day, student-run conference for undergraduate and high school researchers. Posters, paper talks and lightning talks.
          </span>
          <span className="conf-callout-cta">About URTC &amp; interest list →</span>
        </a>

        <div className="page-block">
          <h2 className="page-block-title">Featured</h2>
          <div className="featured-grid featured-grid--3">
            {featuredEventsData.slice(0, 3).map((ev, i) => (
              <FeaturedHighlightCard key={ev.id} {...ev} index={i} />
            ))}
          </div>
        </div>

        {(luma.status === 'loading' || upcoming.length > 0) && (
          <div className="page-block">
            <h2 className="page-block-title">Upcoming</h2>
            {luma.status === 'loading' ? (
              <p className="events-loading">Loading upcoming events…</p>
            ) : (
              <div className="card-grid card-grid--2">
                {upcoming.map((ev, i) => (
                  <UpcomingCard key={ev.id} {...ev} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {recent.length > 0 && (
          <div className="page-block">
            <h2 className="page-block-title">Recent</h2>
            <div className="card-grid card-grid--2">
              {visibleRecent.map((ev, i) => (
                <UpcomingCard key={ev.id} {...ev} dateStr={ev.shortDateStr} index={i} />
              ))}
            </div>
            {recent.length > RECENT_PREVIEW_COUNT && (
              <div className="section-cta">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAllRecent((v) => !v)}
                >
                  {showAllRecent ? 'Show fewer' : `Show all ${recent.length} recent events`}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="page-block">
          <h2 className="page-block-title">Past highlights</h2>
          <div className="card-grid card-grid--2">
            {pastHighlightData.map((h, i) => (
              <PastHighlightCard key={h.id} {...h} index={i} />
            ))}
          </div>
        </div>

        {pressLinksData.length > 0 && (
          <div className="page-block">
            <h2 className="page-block-title">Press</h2>
            <div className="card-grid card-grid--2">
              {pressLinksData.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="press-card"
                >
                  <div className="press-card-outlet">{item.outlet}</div>
                  <div className="press-card-title">{item.title}</div>
                  <div className="press-card-date">{item.dateStr}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="page-block">
          <h2 className="page-block-title">Archive</h2>
          {eventsArchiveData.map((year) => (
            <details key={year.id} className="year-details">
              <summary>{year.label}</summary>
              <div className="year-body">
                {year.events.map((ev) => (
                  <p key={ev}>{ev}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
