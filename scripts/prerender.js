import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Import event data
const eventsPageDataPath = path.resolve(__dirname, '../src/data/eventsPageData.jsx')
const eventsPageDataContent = fs.readFileSync(eventsPageDataPath, 'utf-8')

// Extract event IDs from the data file
const eventPagesMatch = eventsPageDataContent.match(/export const eventPagesData = \[([\s\S]*?)\]/m)
const pastHighlightIdMatch = eventsPageDataContent.match(/export const pastHighlightData = \[([\s\S]*?)\]/m)

const eventIds = new Set()

// Extract IDs from eventPagesData
if (eventPagesMatch) {
  const matches = eventPagesMatch[1].match(/id:\s*(\d+)/g)
  if (matches) {
    matches.forEach(match => {
      const id = match.match(/\d+/)[0]
      eventIds.add(id)
    })
  }
}

const routes = ['/team', '/events', '/ai-compute', '/new', '/chapters', '/mtts', '/eds', '/pes', '/pels', '/resources', '/contact']

// Read the built index.html
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8')

// Link previews: each prerendered page gets its own title, description, URL and image,
// so links shared in email, Slack or social media show a proper card.
const SITE = 'https://web.stanford.edu/group/ieee'
const PAGE_META = {
  '/ai-compute': {
    title: 'AI Compute Orchestration S2S · Nov 13 at Stanford',
    description: 'A day of talks on how AI hardware is built, from silicon to systems. Keynote by Norm Jouppi (Google), with talks and a panel from Samsung, Stanford, Micron and AWS. Free, with breakfast and lunch.',
    image: 'og/ai-compute.jpg',
  },
  '/events': { title: 'Events · Stanford IEEE', description: 'Upcoming talks, firesides and professor lunches, plus past highlights.' },
  '/team': { title: 'Team · Stanford IEEE', description: 'The officers and faculty advisors of the Stanford IEEE Student Branch.' },
  '/new': { title: 'New here? · Stanford IEEE', description: 'How to come to an event, join the mailing list, find a chapter and help run the branch.' },
  '/chapters': { title: 'Chapters · Stanford IEEE', description: 'MTT-S, PES, EDS and PELS: the technical chapters of the Stanford IEEE Student Branch.' },
  '/mtts': { title: 'MTT-S Chapter · Stanford IEEE', description: 'Microwave theory, RF and wireless at Stanford.' },
  '/pes': { title: 'PES Chapter · Stanford IEEE', description: 'Power systems, energy conversion and grid modernization at Stanford.' },
  '/eds': { title: 'EDS Chapter · Stanford IEEE', description: 'Semiconductor devices and fabrication at Stanford.' },
  '/pels': { title: 'PELS Chapter · Stanford IEEE', description: 'Power converters, motor drives and wide-bandgap devices at Stanford.' },
  '/resources': { title: 'Resources · Stanford IEEE', description: 'Resources from the Stanford IEEE Student Branch.' },
  '/contact': { title: 'Contact · Stanford IEEE', description: 'Get in touch with the Stanford IEEE Student Branch.' },
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function withMeta(html, route) {
  const meta = PAGE_META[route]
  if (!meta) return html
  const url = `${SITE}${route}/`
  const image = `${SITE}/${meta.image || 'og/home.jpg'}`
  const set = (attr, key, value) =>
    html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${escapeAttr(value)}$2`)
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(meta.title)}</title>`)
  html = set('name', 'description', meta.description)
  html = set('property', 'og:title', meta.title)
  html = set('property', 'og:description', meta.description)
  html = set('property', 'og:url', url)
  html = set('property', 'og:image', image)
  html = set('name', 'twitter:title', meta.title)
  html = set('name', 'twitter:description', meta.description)
  html = set('name', 'twitter:image', image)
  return html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
}

// Create static routes
routes.forEach((route) => {
  // Create directory for route
  const dir = path.resolve(__dirname, `../dist${route}`)
  fs.mkdirSync(dir, { recursive: true })
  
  // Copy index.html to route directory
  const filePath = path.join(dir, 'index.html')
  fs.writeFileSync(filePath, withMeta(template, route))
  console.log(`✓ Created ${route}/index.html`)
})

// Create dynamic event routes
eventIds.forEach((id) => {
  const eventRoute = `/event/${id}`
  const dir = path.resolve(__dirname, `../dist${eventRoute}`)
  fs.mkdirSync(dir, { recursive: true })
  
  const filePath = path.join(dir, 'index.html')
  fs.writeFileSync(filePath, template)
  console.log(`✓ Created ${eventRoute}/index.html`)
})

// Create .htaccess for Apache routing + cache strategy
// HTML shells must revalidate so deploys pick up new hashed asset names.
// Hashed /assets/* files are safe to cache long-term (filename changes each build).
const htaccess = `RewriteEngine On
RewriteBase /group/ieee/

# ── Cache control ──
<IfModule mod_headers.c>
  # Never long-cache HTML entry points (index.html copies on every route)
  <FilesMatch "\\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </FilesMatch>

  # Vite emits content-hashed filenames — safe to cache aggressively
  <FilesMatch "\\.(js|css|woff2?|png|jpg|jpeg|gif|svg|webp|ico|jfif)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

# Handle subdirectory routing (including nested routes like event/123)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.+?)/?$ /group/ieee/$1/index.html [L]

# Serve root index
RewriteRule ^$ /group/ieee/index.html [L]
`
fs.writeFileSync(path.resolve(__dirname, '../dist/.htaccess'), htaccess)
console.log('✓ Created .htaccess')

console.log('\n✓ All routes prerendered successfully!')
console.log(`✓ Generated ${eventIds.size} event pages`)