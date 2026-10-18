import ChapterPage from '../components/ChapterPage'

const CHAIR_EMAIL = 'sq51e51@stanford.edu'
const INTEREST_FORM_URL = 'https://forms.gle/aBGHrmKrJKXLdMFUA'

export default function PES() {
  return (
    <ChapterPage
      chapterId="pes"
      kicker="PES Student Chapter"
      title="Power & Energy Society"
      description="Technical talks and networking around power systems, energy conversion, grid modernization, and power electronics."
      actions={
        <>
          <a href={INTEREST_FORM_URL} className="btn btn-primary" target="_blank" rel="noreferrer">
            Interest form
          </a>
          <a href="https://www.ieee-pes.org/" className="btn btn-secondary" target="_blank" rel="noreferrer">
            IEEE PES
          </a>
        </>
      }
    >
      <div className="contact-grid">
        <div className="contact-card">
          <h3>Board</h3>
          <p>
            <strong>Chair:</strong> Fabian Cornejo —{' '}
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
