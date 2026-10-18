import ChapterPage from '../components/ChapterPage'
import Reveal from '../components/Reveal'

const upcomingEvents = [
  {
    dateStr: 'Sep 17',
    title: 'Electrical Engineering Graduate Student Resource Fair',
    meta: '12:00 PM · Packard Grove',
    description: 'Come learn more about our student branch chapter!',
  },
  {
    dateStr: 'Oct 7',
    title: 'LeCroy Seminar & Equipment Demo',
    meta: '5:00 PM · Location TBD',
    description:
      'A lecture followed by hands-on demo stations covering high-speed signal testing and measurement equipment, presented by LeCroy/Teledyne. Pizza provided.',
  },
  {
    dateStr: 'Oct 9',
    title: 'IEEE AP-S Distinguished Lecturer Workshop',
    meta: '9:00 AM – 1:30 PM · Allen 101X Building',
    description:
      'A joint AP-S/MTT-S workshop featuring five distinguished lecturers: Sima Noghanian (CRN), Nacer Chatat (NASA/Caltech), Zhen Peng (University of Illinois), Richard E. Hodges (JPL), and Levent Sevgi (Istanbul Technical University). Organized by the IEEE Joint AP/MTT Student Branch Chapter.',
  },
  {
    dateStr: 'Oct 29',
    title: 'SciML Seminar: Prof. Costas Sarris',
    meta: '4:00 PM · Packard 204',
    description:
      '"Scientific Machine Learning for Electromagnetic Field Computations" — Professor Costas Sarris (Electrical and Computer Engineering, University of Toronto) presents a seminar on scientific machine learning (SciML).',
  },
  {
    dateStr: 'Nov 17',
    title: 'MTT-S DML Talk: Dr. Chung-Tse Michael Wu',
    meta: '3:00 PM PT · Zoom (link TBD)',
    description:
      '"Sensing, Tracking, and Secured Communication with Artificial Electromagnetic Materials" — Dr. Wu (Associate Professor, National Taiwan University; formerly Rutgers) discusses metamaterial-based leaky-wave antennas and their applications in real-time sensing, remote monitoring, and secure wireless communication.',
  },
  {
    dateStr: 'TBD',
    title: 'MTT-S Distinguished Lecture: Mahmoud Wagih',
    meta: '2:00 PM · Lecture Room (booked 1:30–3:30 PM)',
    description:
      "Talk on sustainable and biodegradable electronics, covering carbon accounting methods, major contributors to electronics' carbon footprint, and the performance of sustainable materials.",
  },
]

export default function MTTS() {
  return (
    <ChapterPage
      chapterId="mtt-s"
      kicker="MTT-S Student Chapter"
      title="Microwave Theory and Technology"
      description="Technical talks, workshops, and networking around microwave engineering, wireless communications, and RF circuit design."
      actions={
        <>
          <a
            href="https://mailman.stanford.edu/mailman/listinfo/ieee-mtts-list"
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            Mailing list
          </a>
          <a href="https://www.mtt.org/" className="btn btn-secondary" target="_blank" rel="noreferrer">
            IEEE MTT-S
          </a>
        </>
      }
    >
      <div className="page-block" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        <h2 className="page-block-title">Upcoming Events</h2>
        <div className="card-grid card-grid--1">
          {upcomingEvents.map((ev, i) => (
            <Reveal key={ev.title} delay={i * 60}>
              <div className="event-card">
                <span className="event-card-date">{ev.dateStr}</span>
                <div className="event-card-body">
                  <div className="event-card-title">
                    <span>{ev.title}</span>
                    <span className="event-card-date--mobile">{ev.dateStr}</span>
                  </div>
                  <p className="event-card-desc">{ev.meta}</p>
                  <p className="event-card-desc">{ev.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="page-block">
        <div className="contact-grid">
          <div className="contact-card">
            <h3>Board</h3>
            <p>
              <strong>Chair:</strong> Geneva Ecola &mdash;{' '}
              <a href="mailto:gecola@stanford.edu">gecola@stanford.edu</a>
              <br />
              <strong>Vice Chair:</strong> Austin Rothschild &mdash;{' '}
              <a href="mailto:austinxr@stanford.edu">austinxr@stanford.edu</a>
              <br />
              <strong>Treasurer:</strong> Tejus Rao &mdash;{' '}
              <a href="mailto:tejus@stanford.edu">tejus@stanford.edu</a>
              <br />
              <strong>Secretary:</strong> Faris Alghamdi
            </p>
          </div>
          <div className="contact-card">
            <h3>Get involved</h3>
            <p>We welcome speakers from industry and academia.</p>
            <a href="mailto:gecola@stanford.edu" className="btn btn-secondary">Contact the chair</a>
          </div>
        </div>
      </div>
    </ChapterPage>
  )
}
