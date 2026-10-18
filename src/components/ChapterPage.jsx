import { PageHeader } from './Section'
import { chapterById } from '../data/chaptersPageData'

export default function ChapterPage({ chapterId, kicker, title, description, actions, children }) {
  const accent = chapterById(chapterId)?.accent
  return (
    <section className="section page-content chapter-page" style={accent ? { '--chapter-accent': accent } : undefined}>
      <div className="container">
        <PageHeader kicker={kicker} title={title} description={description} />
        {actions && <div className="btn-row chapter-page-actions">{actions}</div>}
        {children}
      </div>
    </section>
  )
}
