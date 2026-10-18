import React from 'react'
import OfficerCard from '../components/OfficerCard'

export default function Team() {
  const baseUrl = import.meta.env.BASE_URL
  const officers = [
    {
      id: 1,
      img: `${baseUrl}img/officers/ethan.jpg`,
      name: 'Ethan Song',
      major: 'BS in Electrical Engineering',
      role: 'Chair',
      href: 'https://www.linkedin.com/in/ethan-s0ng/'
    },
    {
      id: 2,
      img: `${baseUrl}img/officers/fabian.png`,
      name: 'Fabian Cornejo',
      major: 'BS in Sustainable Systems and Power Engineering (IDMEN)',
      role: 'Vice Chair',
      href: 'https://www.linkedin.com/in/fabian-cornejo-8b9423282/'
    },
    {
      id: 3,
      img: `${baseUrl}img/officers/hannah.jpeg`,
      name: 'Hannah Shu',
      major: 'BS in Electrical Engineering',
      role: 'Finance',
      href: 'https://www.linkedin.com/in/hannah-shu/'
    },
    {
      id: 4,
      img: `${baseUrl}img/officers/kierra.jpeg`,
      name: 'Kierra Barr',
      major: 'BS in Electrical Engineering',
      role: 'Logistics',
      href: 'https://www.linkedin.com/in/kierra-barr/'
    },
    {
      // TODO: role is provisional until confirmed
      id: 14,
      img: `${baseUrl}img/officers/zane.jpg`,
      name: 'Zane St. John',
      major: 'BS in Symbolic Systems',
      role: 'Logistics',
      href: 'https://www.linkedin.com/in/zaney/'
    },
    {
      id: 5,
      img: `${baseUrl}img/officers/kristen.jpg`,
      name: 'Kristen Guernsey',
      major: 'MS in Electrical Engineering',
      role: 'Social',
      href: 'https://www.linkedin.com/in/kristen-guernsey/'
    },
    {
      id: 6,
      img: `${baseUrl}img/officers/lydia.jpg`,
      name: 'Lydia Huang',
      major: 'MS in Electrical Engineering',
      role: 'Social',
      href: 'https://www.linkedin.com/in/lydia-huang-alakazoo'
    },
    {
      id: 7,
      img: `${baseUrl}img/officers/brant.png`,
      name: 'Brant Bueno',
      major: 'BS in Electrical Engineering',
      role: 'Industry',
      href: 'https://www.linkedin.com/in/brant-bueno/'
    },
    {
      id: 8,
      img: `${baseUrl}img/officers/weston.png`,
      name: 'Weston Keller',
      major: 'BS in Electrical Engineering and Music',
      role: 'Industry',
      href: 'https://www.linkedin.com/in/weston-keller/'
    },
    {
      id: 9,
      img: `${baseUrl}img/officers/caroline.jpg`,
      name: 'Caroline Geiger',
      major: 'BS in Electrical Engineering',
      role: 'Industry',
      href: 'https://www.linkedin.com/in/carolineegeiger/'
    },
    {
      id: 10,
      img: `${baseUrl}img/officers/sara.jpg`,
      name: 'Sara Kothari',
      major: 'BS in Electrical Engineering; MS in Computer Science',
      role: 'Industry',
      href: 'https://www.linkedin.com/in/sara-kothari/'
    },
    {
      id: 11,
      img: `${baseUrl}img/officers/milly.png`,
      name: 'Milly Wong',
      major: 'BS in Electrical Engineering; MS in Computer Science',
      role: 'Marketing',
      href: 'https://www.linkedin.com/in/millyyuwong/'
    },
    {
      id: 12,
      img: `${baseUrl}img/officers/nubia.png`,
      name: 'Nubia Correa',
      major: 'BS in Electrical Engineering',
      role: 'Marketing',
      href: 'https://www.linkedin.com/in/nubia-correa/'
    },
    {
      id: 13,
      img: `${baseUrl}img/officers/joshi.jpeg`,
      name: 'Joshiro Lawrence',
      major: 'BS in Computer Science',
      role: 'Webmaster',
      href: 'https://www.linkedin.com/in/joshiro-lawrence/'
    },
    {
      id: 15,
      img: `${baseUrl}img/officers/amy.jpg`,
      name: 'Amy Ge',
      major: 'BS in Computer Science',
      role: 'URTC Lead',
      href: 'https://www.linkedin.com/in/yujun-ge/'
    }
  ]

  const facultySupport = [
    {
      id: 17,
      img: `${baseUrl}img/faculty/thomaslee.jpg`,
      name: 'Thomas Lee',
      major: 'Electrical Engineering',
      role: 'Faculty Counselor',
      href: 'https://profiles.stanford.edu/thomas-lee'
    },
    {
      id: 18,
      img: `${baseUrl}img/faculty/markhorowitz.jpg`,
      name: 'Mark Horowitz',
      major: 'Electrical Engineering',
      role: 'Department Chair',
      href: 'https://profiles.stanford.edu/mark-horowitz'
    },
    {
      id: 19,
      img: `${baseUrl}img/faculty/dustinschroeder.jpg`,
      name: 'Dustin Schroeder',
      major: 'Electrical Engineering',
      role: 'Faculty Advisor',
      href: 'https://profiles.stanford.edu/dustin-schroeder'
    }
  ]

  return (
    <section className="section team-page page-content">
      <div className="container">
        <header className="page-header">
          <p className="section-kicker">Team</p>
          <h1 className="page-title">2026–2027 Officers</h1>
          <p className="page-description">
            The Stanford IEEE Student Branch, rebuilt after the pandemic.
          </p>
        </header>

        <div className="page-block" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="officer-grid">
            {officers.map((officer, i) => (
              <OfficerCard key={officer.id} img={officer.img} name={officer.name} role={officer.role} major={officer.major} href={officer.href} index={i} />
            ))}
          </div>
        </div>

        <div className="page-block">
          <h2 className="page-block-title">Faculty support</h2>
          <div className="officer-grid officer-grid--support">
            {facultySupport.map((iA, i) => (
              <OfficerCard key={iA.id} img={iA.img} name={iA.name} role={iA.role} href={iA.href} index={i} />
            ))}
          </div>
        </div>

        <div className="past-officers">
          <h2 className="page-block-title">Past leadership</h2>

        {/* 2025-2026 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2025–2026 </span>
            <span className="year-subtitle">Chair: Ethan Song · Vice Chair: Luke Qiao</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">Chair:</span> Ethan Song</li>
              <li><span className="year-role">Vice Chair:</span> Luke Qiao</li>
              <li><span className="year-role">Chief Financial Officer:</span> Hannah Shu</li>
              <li><span className="year-role">Logistics:</span> Kierra Barr, Fabian Cornejo, Kristen Guernsey, Lydia Huang</li>
              <li><span className="year-role">Industry:</span> Brant Bueno, Weston Keller, Ege Turan, Caroline Geiger</li>
              <li><span className="year-role">Marketing:</span> Milly Wong, Nubia Correa</li>
              <li><span className="year-role">EDS Chair:</span> Grace Sun</li>
              <li><span className="year-role">Webmaster:</span> Joshiro Lawrence</li>
              <li><span className="year-role">Industry Advisors:</span> T. Kim Parnell, Mohan Sankaran, Tom Coughlin, Michael Condry</li>
            </ul>
          </div>
        </details>

        {/* 2015-2016 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2015–2016 </span>
            <span className="year-subtitle">Co-Chairs: Gary Lee &amp; Jeremy Bregman</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">Co-Chairs:</span> Gary Lee, Jeremy Bregman</li>
              <li><span className="year-role">Financial Officer:</span> Michael Leung</li>
              <li><span className="year-role">Industry Liaisons:</span> Jeremy Bregman, Karen Yang</li>
              <li><span className="year-role">Faculty Liaison:</span> Justin Doong</li>
              <li><span className="year-role">Women in Engineering Chair:</span> Neeharika Madduri</li>
              <li><span className="year-role">Executive Board Member:</span> Roshni Cooper</li>
              <li><span className="year-role">General Board Members:</span> Negin Behzadian, Olivier Jin, Richard Mu, Logan Su, Dan Yu, Anna Zeng</li>
            </ul>
          </div>
        </details>

        {/* 2014 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2013–2014 </span>
            <span className="year-subtitle">Chair: Jai Sajnani · Vice Chair: Roshni Cooper</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">Chair:</span> Jai Sajnani</li>
              <li><span className="year-role">Vice Chair:</span> Roshni Cooper</li>
              <li><span className="year-role">EDS Chair:</span> Vijay Narasimhan</li>
              <li><span className="year-role">Women in Engineering Coordinator:</span> Nina Vaidya</li>
              <li><span className="year-role">Financial Officer:</span> Tian Zhao</li>
              <li><span className="year-role">Branding Officer:</span> Gary Lee</li>
              <li><span className="year-role">Outreach Officer:</span> Justin Doong</li>
              <li><span className="year-role">Women in Engineering Coordinator:</span> Naomi Chetan Shah</li>
              <li><span className="year-role">PuzzleMasters:</span> Iretiayo Akinola, Adekunle Awonjinrin</li>
              <li><span className="year-role">Community Impact Officer:</span> Vanessa Friedemann</li>
              <li><span className="year-role">Social Officer:</span> Adebia Ntoso</li>
              <li><span className="year-role">Academic/Faculty Liaison:</span> Vivek Jain</li>
              <li><span className="year-role">General Officer:</span> Mark Kwon</li>
            </ul>
          </div>
        </details>

        {/* 2013 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2012–2013 </span>
            <span className="year-subtitle">Chair: Roshni Cooper · Vice Chair: Howard Ro</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">Chair:</span> Roshni Cooper</li>
              <li><span className="year-role">Vice Chair:</span> Howard Ro</li>
              <li><span className="year-role">EDS Leader:</span> Vijay Narasimhan</li>
              <li><span className="year-role">Women in Engineering Leader:</span> Uche Monu</li>
              <li><span className="year-role">Industry Liaisons:</span> Jai Sajnani, Zachary Kaufman, Nina Vaidya</li>
              <li><span className="year-role">Faculty Liaison:</span> Scott Powers</li>
              <li><span className="year-role">Corporate Liaison:</span> Tian Zhao</li>
              <li><span className="year-role">Social Officer:</span> Vivek Jain</li>
              <li><span className="year-role">General Officers:</span> Rahul Pandey, Vinith Misra, Annie Chiu</li>
              <li><span className="year-role">Webmaster:</span> Akshay Agrawal</li>
            </ul>

            <p className="year-bio">
              Roshni and team expanded technical talks, industry partnerships, and mentoring, while
              running the New Frontiers in Computing conference with local IEEE chapters.
            </p>
          </div>
        </details>

        {/* 2012 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2011–2012 </span>
            <span className="year-subtitle">President: Howard Ro</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">President:</span> Howard Ro</li>
              <li><span className="year-role">General Officer / Corporate Liaison:</span> Rahul Pandey</li>
              <li><span className="year-role">EDS Leader:</span> Vijay Narasimhan</li>
              <li><span className="year-role">Financial Officer:</span> Sameep Mehrotra</li>
              <li><span className="year-role">Public Relations Officer:</span> Long (Peter) Zou</li>
              <li><span className="year-role">Professional Org/Mentoring Officer:</span> Roshni Cooper</li>
              <li><span className="year-role">Mentoring &amp; Outreach:</span> Corinne Horn</li>
              <li><span className="year-role">Corporate Liaisons:</span> Pranav Pai, Tian Zhao</li>
              <li><span className="year-role">Academic Liaison:</span> Hongxia Zhong</li>
            </ul>

            <p className="year-bio">
              This team focused on mentorship, academic connections, and outreach programming,
              especially for younger students and prospective engineers.
            </p>
          </div>
        </details>

        {/* 2010-2011 (Frank's era) */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2010–2011 </span>
            <span className="year-subtitle">Chair: Frank Nothaft · Vice Chair: James Chen</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">Chair:</span> Frank Nothaft</li>
              <li><span className="year-role">Vice Chair:</span> James Chen</li>
              <li><span className="year-role">Secretary/Treasurer:</span> Justin Hou</li>
              <li><span className="year-role">Professional Activities:</span> Steven Soneff, Mingyu Kim, Johnson Hsieh</li>
              <li><span className="year-role">Student Activities:</span> Frank Lin, Katherine Chen</li>
              <li><span className="year-role">Educational Activities:</span> James Hsi</li>
              <li><span className="year-role">Webmaster:</span> Tracy Chou</li>
              <li><span className="year-role">Grill Sergeants:</span> Ian Wong, Vincent Mei</li>
              <li><span className="year-role">Advisers:</span> Siddharth Jonathan, Nitin Dua</li>
            </ul>

            <p className="year-bio">
              Under Frank and James, Stanford IEEE grew its mix of technical talks, industry events,
              and social gatherings — including the legendary BBQs led by Grill Sergeants Ian and Vincent.
            </p>
          </div>
        </details>

        {/* 2008-2009 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2008–2009 </span>
            <span className="year-subtitle">President: Ian Wong</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">President:</span> Ian Wong</li>
              <li><span className="year-role">Co-VP, ECJ & Membership:</span> Gary Chang</li>
              <li><span className="year-role">Co-VP, Mixer, Class & Awards:</span> Vincent Mei</li>
              <li><span className="year-role">CS Chair:</span> Alice & Nancy</li>
              <li><span className="year-role">Corporate Liaison:</span> Yi Gu & Jonathan</li>
              <li><span className="year-role">Publicity Manager:</span> Nikki</li>
              <li><span className="year-role">Social Chair:</span> Sylvia Yun</li>
              <li><span className="year-role">Treasurer:</span> Karthik</li>
              <li><span className="year-role">Webmaster:</span> Tracy Chou</li>
            </ul>
          </div>
        </details>

        {/* 2006-2007 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2006–2007 </span>
            <span className="year-subtitle">Co-Presidents: Yuriy Teslyar & Yoo-Yoo Yeh</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">Co-Presidents: </span> Yuriy Teslyar, Yoo-Yoo Yeh</li>
              <li><span className="year-role">VP ECJ:</span> Ian Wong</li>
              <li><span className="year-role">VP Mixer/Membership:</span> Han Choi</li>
              <li><span className="year-role">Treasurer:</span> Sylvia Yun</li>
              <li><span className="year-role">Secretary:</span> Albert Chen</li>
              <li><span className="year-role">Research & Competitions Co-Chairs:</span> Tracy Chou, Vincent Mei</li>
              <li><span className="year-role">ECJ Co-Editor-in-Chief:</span> Gary Chang</li>
              <li><span className="year-role">Publicity Manager: </span> Jong Kim</li>
              <li><span className="year-role">Corporate Liason: </span> Yi Gu</li>
              <li><span className="year-role">Community Service Chair:</span> Akintunde Maiyegun</li>
            </ul>
            {/* TODO: Consider adding year-bio, or removing all of them since they look GPT'd
            <p className="year-bio">
              
            </p>
            */}
          </div>
        </details>

        {/* 2005-2006 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2005–2006 </span>
            <span className="year-subtitle">President: Dmitry Belogolovsky</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">President:</span> Dmitry Belogolovsky</li>
              <li><span className="year-role">VP:</span> Yuriy Teslyar</li>
              <li><span className="year-role">Corporate Liaison:</span> Francis Doumet</li>
              <li><span className="year-role">Secretary:</span> Kahye Song</li>
              <li><span className="year-role">Treasurer:</span> Yoo-Yoo Yeh</li>
              <li><span className="year-role">Research & Competitions:</span> Omair Saadat</li>
              <li><span className="year-role">Community Service:</span> Ryan Propper</li>
              <li><span className="year-role">Publicity Manager: </span> Kishore Jayanti</li>
              <li><span className="year-role">ECJ Editor-in-Chief: </span> William Liou</li>
              <li><span className="year-role">Webmaster:</span> Kishore Jayanti</li>
              <li><span className="year-role">Advisors:</span> Professor Ed McCluskey, Clara Shih</li>
            </ul>
            <a target="_blank" href="https://docs.google.com/document/d/1jr6Bse849oE4ahwJA-Ybbw5G4elh_hG1/edit?usp=drive_link&ouid=108743721022922172832&rtpof=true&sd=true">Handbook 2005-2006</a>
            {/* TODO: Consider adding year-bio, or removing all of them since they look GPT'd
            <p className="year-bio">
              
            </p>
            */}
          </div>
        </details>

        {/* 2003-2004 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2003–2004 </span>
            <span className="year-subtitle">President: Clara Shih</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">President:</span> Clara Shih</li>
              <li><span className="year-role">VP:</span> Joshua Reeves</li>
              <li><span className="year-role">Treasurer:</span> Dmitry Belogolovsky</li>
              <li><span className="year-role">Secretary:</span> Su Fen Lee</li>
              <li><span className="year-role">SA/Webmaster:</span> Alex Chow</li>
              <li><span className="year-role">Corporate Liaison:</span> Kevin Shen</li>
              <li><span className="year-role">Community Service:</span> Nancy Wu, William Liou</li>
              <li><span className="year-role">Competitions Chair: </span> Yuriy Teslyar</li>
              <li><span className="year-role">Publicity Manager:</span> Yoo-Hsiu Yeh</li>
              <li><span className="year-role">Regional Liaison: </span> Albert Hsu</li>
              <li><span className="year-role">Social Chair:</span> A. Justin Sabet-Peyman</li>
            </ul>
            <a target="_blank" href="https://docs.google.com/document/d/1_EfhamUj95yo5o4BdQf8ylaVuX6JUMKK/edit?usp=drive_link&ouid=108743721022922172832&rtpof=true&sd=true">Handbook 2003-2004</a>
            {/* TODO: Consider adding year-bio, or removing all of them since they look GPT'd
            <p className="year-bio">
              
            </p>
            */}
          </div>
        </details>

        {/* 2002-2003 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2002–2003 </span>
            <span className="year-subtitle">President: Clara Shih</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">President:</span> Clara Shih</li>
              <li><span className="year-role">VP:</span> Cher Wee Lim</li>
              <li><span className="year-role">Treasurer:</span> Elizabeth Williams</li>
              <li><span className="year-role">Secretary:</span> Agnes Li</li>
              <li><span className="year-role">Undergrad Coordinator:</span> Anthony Hui</li>
              <li><span className="year-role">Graduate Coordinator:</span> Pierre Ponce, Saad Waqas</li>
              <li><span className="year-role">Corporate Liaison:</span> Joshua Reeves</li>
              <li><span className="year-role">Competitions Chair: </span> Su Fen Lee</li>
              <li><span className="year-role">Webmaster:</span> Chee Hau Tan, William Lu</li>
              <li><span className="year-role">System Administrator: </span> Eric Sun</li>
              <li><span className="year-role">Publicity Manager:</span> Kevin Shen</li>
              <li><span className="year-role">Community Service:</span> Nancy Wu</li>
              <li><span className="year-role">Regional Liaison:</span> Pedram Keyani</li>
            </ul>
            <a target="_blank" href="https://docs.google.com/document/d/1iJLaBNplPwtWSw0HE9DgoD8X4Oi9-Iy3/edit?usp=drive_link&ouid=108743721022922172832&rtpof=true&sd=true">Handbook 2002-2003</a>
            {/* TODO: Consider adding year-bio, or removing all of them since they look GPT'd
            <p className="year-bio">
              
            </p>
            */}
          </div>
        </details>

        {/* 2001-2002 */}
        <details className="year-details">
          <summary className="year-summary">
            <span className="year-label">2001–2002 </span>
            <span className="year-subtitle">President: Clara Shih</span>
          </summary>
          <div className="year-body">
            <ul>
              <li><span className="year-role">President:</span> Clara Shih</li>
              <li><span className="year-role">Vice President:</span> Eric Tao</li>
              <li><span className="year-role">Treasurer:</span> Jon Effrat</li>
              <li><span className="year-role">Secretary:</span> Terence Chia</li>
              <li><span className="year-role">Internal Affairs Coordinator:</span> Chiung-Fu Shih</li>
              <li><span className="year-role">VP Internal / Campus Activities:</span> Patrick Wong</li>
              <li><span className="year-role">Corporate Liaisons:</span> Pierre Ponce, Vidya Chander, Elizabeth Williams</li>
              <li><span className="year-role">Undergraduate Coordinator:</span> Marlayna Lyndra Tuiasosopo</li>
              <li><span className="year-role">Graduate Coordinator:</span> Ryan Barrett</li>
              <li><span className="year-role">Professional Liaisons:</span> Manoneet Singh, Jonathan David, Ken Doniger</li>
              <li><span className="year-role">Webmaster:</span> Eric Sun</li>
              <li><span className="year-role">Faculty Sponsor:</span> Prof. Edward McCluskey</li>
            </ul>

            <p className="year-bio">
              This early-2000s team built core traditions in corporate outreach, professional liaisons,
              and mentoring that later branches would inherit and expand.
            </p>
          </div>
        </details>

        </div>
      </div>
    </section>
  )
}
