import { Link } from 'react-router-dom'
import Reveal from './Reveal'

// Hand-written events open their /event/:id page; Luma events (href) open on luma.com.
export default function UpcomingCard({ id, dateStr, title, details, image, href, chapters = [], index = 0 }) {
  const content = (
    <>
      {image && (
        <div className="event-card-thumb">
          <img src={image} alt={title} loading="lazy" />
        </div>
      )}
      <span className="event-card-date">{dateStr}</span>
      <div className="event-card-body">
        <div className="event-card-title">
          <span>{title}</span>
          <span className="event-card-date--mobile">{dateStr}</span>
          <span className="event-card-arrow" aria-hidden="true">{href ? '↗' : '→'}</span>
        </div>
        {chapters.length > 0 && (
          <div className="chapter-chips">
            {chapters.map((ch) => (
              <span key={ch.id} className="chapter-chip" style={{ '--chapter-accent': ch.accent }}>
                {ch.short}
              </span>
            ))}
          </div>
        )}
        <p className="event-card-desc">{details}</p>
      </div>
    </>
  )

  const accentStyle = chapters.length ? { '--chapter-accent': chapters[0].accent } : undefined
  const chapterClass = chapters.length ? ' event-card--chapter' : ''

  return (
    <Reveal delay={index * 60}>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={`event-card event-card--interactive${chapterClass}`} style={accentStyle}>
          {content}
        </a>
      ) : (
        <Link to={`/event/${id}`} className={`event-card event-card--interactive${chapterClass}`} style={accentStyle}>
          {content}
        </Link>
      )}
    </Reveal>
  )
}
