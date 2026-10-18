import { Link } from 'react-router-dom'
import { PageHeader } from '../components/Section'
import { branchCalendarUrl } from '../data/chaptersPageData'
import { BRANCH_EMAIL, MAILING_LIST_URL, SOCIAL_LINKS } from '../data/homeData'

const STEPS = [
  {
    title: 'Come to an event',
    body: 'Everything is free and open to any Stanford student. You don’t need to be an IEEE member. RSVP on Luma so we can plan food.',
    actions: [
      { label: 'Upcoming events', to: '/events', primary: true },
      { label: 'Luma calendar ↗', href: branchCalendarUrl },
    ],
  },
  {
    title: 'Join the mailing list',
    body: 'New events go out by email first, along with calls for help when we need it.',
    actions: [{ label: 'Sign up ↗', href: MAILING_LIST_URL, primary: true }],
  },
  {
    title: 'Find a chapter',
    body: 'MTT-S, PES, EDS and PELS each focus on one area of electrical engineering and run their own events.',
    actions: [{ label: 'Chapters', to: '/chapters', primary: true }],
  },
  {
    title: 'Help run the branch',
    body: 'Open officer roles are announced on the mailing list. If you want to help before then, email us.',
    actions: [
      { label: 'Email us', href: `mailto:${BRANCH_EMAIL}`, primary: true },
      { label: 'Meet the team', to: '/team' },
    ],
  },
]

function Action({ label, to, href, primary }) {
  const className = `btn ${primary ? 'btn-primary' : 'btn-secondary'}`
  if (to) return <Link to={to} className={className}>{label}</Link>
  const external = href.startsWith('http')
  return (
    <a href={href} className={className} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {label}
    </a>
  )
}

export default function NewHere() {
  return (
    <section className="section page-content">
      <div className="container">
        <PageHeader
          kicker="New here"
          title="Start here"
          description="Stanford IEEE is the student branch of IEEE, the largest technical professional organization in the world. We host talks, firesides and small lunches with engineers, founders and professors."
        />

        <div className="new-steps">
          {STEPS.map((step, i) => (
            <article key={step.title} className="new-step">
              <span className="new-step-num">0{i + 1}</span>
              <h2 className="new-step-title">{step.title}</h2>
              <p className="new-step-body">{step.body}</p>
              <div className="new-step-actions">
                {step.actions.map((a) => (
                  <Action key={a.label} {...a} />
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="page-block">
          <h2 className="page-block-title">Do I need an IEEE membership?</h2>
          <p className="new-note">
            No. Membership is optional and separate from the branch. It adds IEEE publications and society memberships at
            student rates, which some people find useful for research.{' '}
            <a href="https://www.ieee.org/membership/join/" target="_blank" rel="noreferrer">Join IEEE ↗</a>
          </p>
        </div>

        {SOCIAL_LINKS.length > 0 && (
          <div className="page-block">
            <h2 className="page-block-title">Follow along</h2>
            <div className="new-socials">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="btn btn-secondary">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
