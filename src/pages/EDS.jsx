import ChapterPage from '../components/ChapterPage'

export default function EDS() {
  return (
    <ChapterPage
      chapterId="eds"
      kicker="EDS Student Chapter"
      title="Electron Devices Society"
      description="Technical talks and networking around semiconductor devices, solid-state electronics, and micro/nano fabrication."
      actions={
        <>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfQfyJxnFP3W_WyYjT_ofSeo_y9nYnISbUV3-6LmPTno1RBRQ/viewform"
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            Interest form
          </a>
          <a href="https://eds.ieee.org/" className="btn btn-secondary" target="_blank" rel="noreferrer">
            IEEE EDS
          </a>
        </>
      }
    >
      <div className="contact-grid">
        <div className="contact-card">
          <h3>Board</h3>
          <p>
            <strong>Chair:</strong> Grace Sun —{' '}
            <a href="mailto:grace.sun2@stanford.edu">grace.sun2@stanford.edu</a>
          </p>
        </div>
        <div className="contact-card">
          <h3>Get involved</h3>
          <p>We welcome speakers from industry and academia.</p>
          <a href="mailto:grace.sun2@stanford.edu" className="btn btn-secondary">Contact the chair</a>
        </div>
      </div>
    </ChapterPage>
  )
}
