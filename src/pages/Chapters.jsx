import { Link } from 'react-router-dom'
import {
  branchCalendarUrl,
  chapters,
  chaptersPageMeta,
} from '../data/chaptersPageData'
import { PageHeader } from '../components/Section'

export default function Chapters() {
  return (
    <section className="section page-content">
      <div className="container">
        <PageHeader
          kicker={chaptersPageMeta.kicker}
          title={chaptersPageMeta.title}
          description={chaptersPageMeta.description}
        />

        <p className="chapters-callout">
          Branch events:{' '}
          <a href={branchCalendarUrl} target="_blank" rel="noreferrer">Luma calendar</a>
          {' · '}
          <Link to="/events">Events page</Link>
          {' · '}
          Bay Area chapter talks: <Link to="/resources">Resources</Link>
        </p>

        <div className="card-grid card-grid--2">
          {chapters.map((ch) => (
            <article key={ch.id} className="chapter-card" style={{ '--chapter-accent': ch.accent }}>
              <div>
                <h3 className="chapter-card-title">{ch.summaryTitle}</h3>
                {ch.badge ? <span className="chapter-badge">{ch.badge}</span> : null}
              </div>
              {ch.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {ch.chapterPage ? (
                <div className="btn-row" style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                  <Link to={ch.chapterPage.path} className="btn btn-secondary">
                    {ch.chapterPage.label}
                  </Link>
                </div>
              ) : null}
              {ch.links?.length ? (
                <p className="chapter-card-links">
                  {ch.links.map((link, i) => (
                    <span key={link.href}>
                      {i > 0 ? ' · ' : null}
                      <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
                    </span>
                  ))}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
