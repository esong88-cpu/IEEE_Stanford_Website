import { useEffect, useState } from 'react'
import { eventsNotOnLuma } from './eventsPageData'
import { chaptersForText } from './chaptersPageData'

// Cloudflare Worker that serves the Luma calendar as JSON (see worker/luma-events).
// Dev and production both use the deployed Worker; `npm run dev:local-events`
// points at a local one (`npm run worker:dev`) via VITE_LUMA_EVENTS_URL.
const LUMA_EVENTS_URL =
  import.meta.env.VITE_LUMA_EVENTS_URL || 'https://ieee-stanford-events.ieee-stanford.workers.dev'

const TIME_ZONE = 'America/Los_Angeles'

const pacificParts = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})
const weekdayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'long' })
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit' })

function toPacific(date) {
  return Object.fromEntries(pacificParts.formatToParts(date).map((p) => [p.type, Number(p.value)]))
}

function toCard(ev) {
  const start = new Date(ev.start)
  const { year, month, day } = toPacific(start)
  return {
    id: ev.id,
    date: start,
    end: new Date(ev.end),
    title: ev.title,
    dateStr: `${weekdayFmt.format(start)}, ${month}/${day} @ ${timeFmt.format(start)}`,
    shortDateStr: `${month}/${day}/${String(year).slice(-2)}`,
    details: ev.description || ev.location?.split(',')[0] || '',
    location: ev.location?.split(',')[0] || '',
    image: ev.image || undefined,
    href: ev.url,
    chapters: chaptersForText(`${ev.title} ${ev.description || ''}`).map(({ id, short, accent }) => ({ id, short, accent })),
  }
}

// Luma is the source of truth for event lists. The only hand-written additions are
// past events that were never put on Luma.
function splitEvents(lumaEvents, now = new Date()) {
  const events = [...lumaEvents.map(toCard), ...eventsNotOnLuma]
  const isUpcoming = (e) => (e.end || e.date) >= now
  return {
    upcoming: events.filter(isUpcoming).sort((a, b) => a.date - b.date),
    recent: events.filter((e) => !isUpcoming(e)).sort((a, b) => b.date - a.date),
  }
}

// Event for the site-wide banner: one that started under 30 minutes ago, or starts
// today or tomorrow. If several qualify, the one starting closest to now wins.
export function getBannerEvent(events) {
  const now = new Date()
  const halfHourAgo = new Date(now.getTime() - 30 * 60 * 1000)
  const endOfTomorrow = new Date(now)
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1)
  endOfTomorrow.setHours(23, 59, 59, 999)

  const candidates = events.filter((e) => e.date >= halfHourAgo && e.date <= endOfTomorrow)
  if (candidates.length === 0) return null

  const chosen = candidates.reduce((closest, e) =>
    Math.abs(e.date - now) < Math.abs(closest.date - now) ? e : closest
  )
  return { ...chosen, isOngoing: chosen.date <= now }
}

// One request per page load, shared by every component that asks.
let request = null

function loadLumaEvents() {
  if (!request) {
    request = fetch(LUMA_EVENTS_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Events request failed: ${res.status}`)
        return res.json()
      })
      .then((data) => splitEvents(data.events))
    // Let a later mount retry if this one failed.
    request.catch(() => {
      request = null
    })
  }
  return request
}

// status: 'loading' | 'ready' | 'error'
export function useLumaEvents() {
  const [state, setState] = useState({ status: 'loading', upcoming: [], recent: [] })

  useEffect(() => {
    let active = true
    loadLumaEvents()
      .then((data) => active && setState({ status: 'ready', ...data }))
      .catch(() => active && setState({ status: 'error', upcoming: [], recent: [] }))
    return () => {
      active = false
    }
  }, [])

  return state
}
