/**
 * AI Compute Orchestration S2S symposium (Nov 13, 2026).
 * Program, speakers, and committee mirror the conference design canvas.
 */
const baseUrl = import.meta.env.BASE_URL
const img = (file) => `${baseUrl}img/events/ai-compute/${file}`

export const aiComputeMeta = {
  path: '/ai-compute',
  kicker: 'Inaugural symposium · 2026',
  title: 'AI Compute Orchestration S2S',
  subtitle: 'From Silicon to Systems',
  description:
    'A half-day of talks on how AI hardware is built, layer by layer, then a panel. Free, with breakfast and lunch.',
  dateStr: 'Fri, Nov 13, 2026',
  startsAt: new Date('2026-11-13T08:30:00-08:00'),
  timeStr: '8:30 AM – 2 PM',
  where: 'Allen 101X, Stanford',
  seats: 'About 70 seats, first come, first served.',
  lumaUrl: 'https://luma.com/kv8u97ga',
  hostedBy: 'Stanford IEEE Student Branch',
  sponsoredBy: 'IEEE Circuits and Systems Society (CASS)',
  speakersFrom: 'Samsung, Stanford, Micron, Amazon & Anthropic',
}

export const aiComputeVenue = [
  { label: 'Where', value: 'Allen 101X, next to the Paul G. Allen Building, Stanford' },
  { label: 'Parking', value: 'Via Ortega Garage (paid)' },
  { label: 'Food', value: 'Breakfast and lunch, served outside the auditorium' },
  { label: 'Contact', value: 'ieee@ee.stanford.edu', href: 'mailto:ieee@ee.stanford.edu' },
]

// tag: '' | 'Keynote' | 'Panel'; kind: 'talk' | 'quiet' (breaks, meals, remarks) | 'tba'
export const aiComputeProgram = [
  { time: '8:00', title: 'Check-in and breakfast', who: '', kind: 'quiet' },
  { time: '8:30', title: 'Welcome', who: 'Ethan Song, Stanford IEEE · Kee-Bong Song, Samsung Semiconductor', kind: 'quiet' },
  { time: '8:45', title: 'Opening keynote', who: 'Speaker to be announced', tag: 'Keynote' },
  { time: '9:15', title: 'Data representation for AI hardware', who: 'Thierry Tambe, Stanford' },
  { time: '9:45', title: 'From KV Cache Offloading to Agent Workflow: How AI Memory Movement Works in System Software', who: 'Dongjoo Seo, Samsung Semiconductor' },
  { time: '10:15', title: 'Domain-specific accelerators', who: 'Kiran Gunnam, Micron' },
  { time: '10:45', title: 'Break', who: '', kind: 'quiet' },
  { time: '11:00', title: 'Title to come', who: 'Youngsuk Park, Amazon', kind: 'tba' },
  { time: '11:20', title: 'Title to come', who: 'Anthropic · speaker to be announced', kind: 'tba' },
  { time: '11:40', title: 'Multi-physical Challenges and Trends of 2.5D/3D Advanced Packaging for High-Current AI Processor Stacks', who: 'Vincent (WooPoung) Kim, Samsung' },
  { time: '12:00', title: 'Lunch', who: '', kind: 'quiet' },
  { time: '1:00', title: 'Orchestrating the stack', who: 'Tom Lee, Joonhoi Hur · moderated by Jawad Nasrullah', tag: 'Panel' },
  { time: '1:55', title: 'Closing remarks', who: 'Nathan Chang and Elkim Roa Fuentes, Samsung Semiconductor', kind: 'quiet' },
]

// photo: '' shows initials (or "TBA" when tba is set).
export const aiComputeSpeakers = [
  { name: 'To be announced', role: 'Keynote speaker', org: 'Announcing soon', photo: '', tba: true, tag: 'Keynote' },
  {
    name: 'Thierry Tambe',
    role: 'Assistant Professor of Electrical Engineering',
    org: 'Stanford University',
    photo: img('tambe.jpg'),
    bio: 'Co-designs AI algorithms and the silicon that runs them, with a focus on number formats and memory efficiency. Previously at NVIDIA and Intel. PhD, Harvard.',
  },
  {
    name: 'Dongjoo Seo',
    role: 'Senior Manager',
    org: 'Samsung Semiconductor',
    photo: img('seo.jpg'),
    talk: 'From KV Cache Offloading to Agent Workflow: How AI Memory Movement Works in System Software',
    abstract:
      'AI systems spend much of their effort moving and preserving state around accelerator compute. This talk follows the KV cache from GPU memory into host DRAM, fabric-attached memory and SSDs, showing how system software decides what to reuse, schedules transfers and readies data for compute, with examples from LMCache, vLLM and SGLang. It then looks at how agent workflows change cache placement and prefetching, and where hardware–software co-design can make memory movement more predictable.',
    bio: 'Develops system software for emerging memory, storage and AI infrastructure at Samsung Semiconductor, focusing on operating systems, fabric-attached memory, memory tiering and efficient LLM inference. PhD in Computer Science, UC Irvine.',
  },
  {
    name: 'Kiran Gunnam',
    role: 'IEEE CASS Distinguished Lecturer',
    org: 'Micron',
    photo: img('gunnam.jpg'),
    bio: 'Designs hardware for error correction, memory and machine learning, with more than 100 U.S. patents. Chairs IEEE P3109, which standardizes arithmetic formats for ML.',
  },
  {
    name: 'Youngsuk Park',
    role: 'Principal Applied Scientist, AWS AI Labs',
    org: 'Amazon',
    photo: '',
    bio: 'Leads work on efficient foundation-model training and inference on AWS Trainium and Inferentia. PhD in Electrical Engineering, Stanford.',
  },
  { name: 'To be announced', role: 'Speaker', org: 'Anthropic', photo: '', tba: true },
  {
    name: 'Vincent (WooPoung) Kim',
    role: 'Advisor for Advanced Packaging',
    org: 'Samsung Device Solutions Research America',
    photo: img('kim.jpg'),
    talk: 'Multi-physical Challenges and Trends of 2.5D/3D Advanced Packaging for High-Current AI Processor Stacks',
    abstract:
      'As transistor scaling slows, 2.5D/3D advanced packaging has become a main driver of system-level performance, power efficiency and integration density. Tightly integrating multiple dies brings electrical, thermal and mechanical effects that cannot be solved separately. This talk reviews the challenges and emerging trends across simulation, manufacturing and reliability, and how those effects interact.',
    bio: 'Previously led the packaging division at Samsung Device Solutions Research America. Before Samsung, he was System Architect for signal and power integrity at Apple, and designed packages and memory systems at Qualcomm, Texas Instruments and Rambus. PhD in ECE, Georgia Tech.',
  },
  {
    name: 'Tom Lee',
    role: 'Professor of Electrical Engineering',
    org: 'Stanford University',
    photo: img('lee.jpg'),
    tag: 'Panel',
    bio: 'Designs RF and high-speed circuits and wrote the standard text on CMOS RF design. Co-founded Matrix Semiconductor and directed DARPA’s Microsystems Technology Office.',
  },
  {
    name: 'Joonhoi Hur',
    role: 'Corporate Vice President',
    org: 'Samsung',
    photo: '',
    tag: 'Panel',
    bio: 'Leads a Samsung circuits lab working on high-speed I/O. Previously designed RF systems and ICs at Apple, Qualcomm and Texas Instruments.',
  },
  {
    name: 'Jawad Nasrullah',
    role: 'CEO',
    org: 'Palo Alto Electron',
    photo: img('nasrullah.jpg'),
    tag: 'Moderator',
    bio: 'Works on chiplets and 3D integration, and co-leads the Open Compute Project’s Open Chiplet Economy effort. Co-founded zGlue. PhD, Stanford.',
  },
]

export const aiComputeCommittee = [
  { name: 'Ethan Song', role: 'Chair, Stanford IEEE Student Branch' },
  { name: 'Kee-Bong Song', role: 'Samsung Semiconductor · IEEE CASS Industry Division' },
  { name: 'Nathan (Naehyuck) Chang', role: 'Samsung Semiconductor' },
  { name: 'Elkim Roa Fuentes', role: 'Samsung Semiconductor · IEEE CASS' },
  { name: 'Jawad Nasrullah', role: 'Palo Alto Electron' },
  { name: 'Gabriele Manganaro', role: 'MediaTek · VP of Publications, IEEE CASS' },
  { name: 'Rajiv Joshi', role: 'IBM T. J. Watson Research Center' },
]
