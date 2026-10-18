import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Banner from './components/Banner'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Team from './pages/Team'
import Events from './pages/Events'
import Resources from './pages/Resources'
import Chapters from './pages/Chapters'
import MTTS from './pages/MTTS'
import EDS from './pages/EDS'
import PES from './pages/PES'
import PELS from './pages/PELS'
import Contact from './pages/Contact'
import Event from './pages/Event'
import AICompute from './pages/AICompute'

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', { page_path: location.pathname })
    }
  }, [location.pathname])

  return (
    <div className="page">
      <Banner />
      <Nav />
      <main key={location.pathname} className="main-enter">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<Event />} />
          <Route path="/ai-compute" element={<AICompute />} />
          <Route path="/chapters" element={<Chapters />} />
          <Route path="/mtts" element={<MTTS />} />
          <Route path="/eds" element={<EDS />} />
          <Route path="/pes" element={<PES />} />
          <Route path="/pels" element={<PELS />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
