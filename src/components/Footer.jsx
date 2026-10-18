import { Link } from 'react-router-dom'
import { BRANCH_EMAIL, MAILING_LIST_URL } from '../data/homeData'
import { branchCalendarUrl } from '../data/chaptersPageData'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container container-wide site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-logo">
            <img src={`${import.meta.env.BASE_URL}img/ieee.png`} alt="" />
            IEEE / Stanford
          </span>
          <span className="site-footer-tagline">Student Branch, est. 2001</span>
        </div>

        <nav className="site-footer-col" aria-label="Footer">
          <span className="site-footer-heading">Explore</span>
          <Link to="/events">Events</Link>
          <Link to="/chapters">Chapters</Link>
          <Link to="/team">Team</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="site-footer-col">
          <span className="site-footer-heading">Connect</span>
          <a href={MAILING_LIST_URL} target="_blank" rel="noreferrer">Mailing list</a>
          <a href={branchCalendarUrl} target="_blank" rel="noreferrer">Luma calendar</a>
          <a href="https://www.linkedin.com/company/stanford-ieee/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={`mailto:${BRANCH_EMAIL}`}>{BRANCH_EMAIL}</a>
        </div>
      </div>
      <div className="container container-wide">
        <p className="site-footer-copy">© {new Date().getFullYear()} Stanford IEEE Student Branch</p>
      </div>
    </footer>
  )
}
