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

const routes = ['/team', '/events', '/ai-compute', '/chapters', '/mtts', '/eds', '/pes', '/pels', '/resources', '/contact']

// Read the built index.html
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8')

// Create static routes
routes.forEach((route) => {
  // Create directory for route
  const dir = path.resolve(__dirname, `../dist${route}`)
  fs.mkdirSync(dir, { recursive: true })
  
  // Copy index.html to route directory
  const filePath = path.join(dir, 'index.html')
  fs.writeFileSync(filePath, template)
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