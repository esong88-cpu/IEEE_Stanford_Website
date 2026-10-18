/** Hand-picked content for the home page. Events and chapter counts come from Luma. */
const baseUrl = import.meta.env.BASE_URL

export const homeTagline =
  'Talks and small-group lunches with engineers, founders and professors, open to any Stanford student.'

export const pastSpeakers = [
  { name: 'Steve Wozniak', org: 'Apple' },
  { name: 'John Hennessy', org: 'Stanford · Alphabet' },
  { name: 'Andy Bechtolsheim', org: 'Arista' },
  { name: 'Clara Shih', org: 'Salesforce AI' },
  { name: 'Andrew Feldman', org: 'Cerebras' },
  { name: 'George Kurian', org: 'NetApp' },
  { name: 'Richard Ho', org: 'OpenAI' },
]

// Photo cards; each links to its /event/:id page.
export const speakerSpotlight = [
  { eventId: 3, name: 'Steve Wozniak', meta: 'Apple co-founder · Feb 2026', image: `${baseUrl}img/events/woz/woz.JPG` },
  { eventId: 4, name: 'Andy Bechtolsheim', meta: 'Sun · Arista · Feb 2026', image: `${baseUrl}img/events/bechtolsheim/bechtolsheim.JPG` },
  { eventId: 8, name: 'Richard Ho', meta: 'Head of Hardware, OpenAI · Apr 2026', image: `${baseUrl}img/events/openai/richard.jpg` },
]

export const homeStats = [
  { value: 25, suffix: '+', label: 'Years on campus' },
  { value: 50, suffix: '+', label: 'Events hosted' },
  { value: 4, suffix: '', label: 'Technical chapters' },
]

export const facultyAdvisors = ['Prof. Thomas Lee', 'Prof. Dustin Schroeder']

export const BRANCH_EMAIL = 'ieee@ee.stanford.edu'
export const MAILING_LIST_URL = 'https://forms.gle/bCdLGNa4bYvpxj3f7'
