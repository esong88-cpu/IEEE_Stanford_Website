import ChapterPage from '../components/ChapterPage'

const CHAIR_EMAIL = 'yezc15@stanford.edu'

export default function PELS() {
  return (
    <ChapterPage
      chapterId="pels"
      kicker="PELS Student Chapter"
      title="Power Electronics Society"
      description="Technical talks and networking around power converters, motor drives, wide-bandgap devices, and energy conversion hardware."
      actions={
        <>
          <a href={`mailto:${CHAIR_EMAIL}`} className="btn btn-primary">
            Contact the chair
          </a>
          <a href="https://www.ieee-pels.org/" className="btn btn-secondary" target="_blank" rel="noreferrer">
            IEEE PELS
          </a>
        </>
      }
    >
      <div className="contact-grid">
        <div className="contact-card">
          <h3>Board</h3>
          <p>
            <strong>Chair:</strong> Zhechi Ye —{' '}
            <a href={`mailto:${CHAIR_EMAIL}`}>{CHAIR_EMAIL}</a>
          </p>
        </div>
        <div className="contact-card">
          <h3>Get involved</h3>
          <p>We welcome speakers from industry and academia.</p>
          <a href={`mailto:${CHAIR_EMAIL}`} className="btn btn-secondary">Contact the chair</a>
        </div>
      </div>
    </ChapterPage>
  )
}
