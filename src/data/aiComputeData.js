/**
 * AI Compute Orchestration S2S symposium (Nov 13, 2026).
 * Program follows the organizers' agenda of Oct 19, 2026 (keynote moved to 11:15),
 * with the afternoon guest slot dropped on Oct 26.
 */
const baseUrl = import.meta.env.BASE_URL
const img = (file) => `${baseUrl}img/events/ai-compute/${file}`
const logo = (file) => img(`logos/${file}`)

export const aiComputeMeta = {
  path: '/ai-compute',
  title: 'AI Compute Orchestration S2S',
  subtitle: 'From Silicon to Systems',
  description: 'A day of talks on how AI hardware is built, from silicon to systems, then a panel. Free, with breakfast and lunch.',
  dateStr: 'Fri, Nov 13, 2026',
  startsAt: new Date('2026-11-13T09:00:00-08:00'),
  timeStr: '9 AM – 3:15 PM',
  where: 'Allen 101X, Stanford',
  seatsShort: 'About 70 seats',
  lumaUrl: 'https://luma.com/kv8u97ga',
  contact: 'ieee@ee.stanford.edu',
  parking: 'Via Ortega Garage',
  deadlineStr: 'Nov 6',
}

export const aiComputeLogos = {
  stanfordIeee: img('stanford-ieee.png'),
  cass: img('ieee-cass.png'),
  samsung: img('samsung.svg'),
}

const SPEAKERS = {
  tambe: {
    name: 'Thierry Tambe',
    org: 'Stanford',
    logo: logo('stanford.svg'),
    photo: img('tambe.jpg'),
    abstract:
      'The unabated pursuit for omniscient and omnipotent AI is levying hefty latency, memory, and energy taxes across all computing scales. Our research is building a heterogeneity of full-stack solutions to produce breakthrough advances in arithmetic performance and energy efficiency for on-chip AI—with a strong emphasis on memory efficiency. In this talk, I will present a series of silicon-proven (16nm/12nm/7nm) numerical representations for efficient AI—spanning per-tensor to per-vector scaling to block-level adaptive codebook encodings—validated in inference and fine-tuning of generative AI workloads.',
    bio: 'Assistant Professor of Electrical Engineering (and, by courtesy, Computer Science) at Stanford, working on algorithm–hardware co-design for efficient AI. Previously at NVIDIA and Intel. PhD, Harvard.',
  },
  seo: {
    name: 'Dongjoo Seo',
    org: 'Samsung Semiconductor',
    logo: logo('samsung.svg'),
    photo: img('seo.jpg'),
    abstract:
      'AI systems spend much of their effort moving and preserving state around accelerator compute. This talk follows the KV cache from GPU memory into host DRAM, fabric-attached memory and SSDs, showing how system software decides what to reuse, schedules transfers and readies data for compute, with examples from LMCache, vLLM and SGLang. It then looks at how agent workflows change cache placement and prefetching, and where hardware–software co-design can make memory movement more predictable.',
    bio: 'Senior Manager building system software for emerging memory, storage and AI infrastructure: memory tiering, fabric-attached memory and efficient LLM inference. PhD, UC Irvine.',
  },
  gunnam: {
    name: 'Kiran Gunnam',
    org: 'Micron',
    logo: logo('micron.svg'),
    photo: img('gunnam.jpg'),
    abstract:
      'As the demand for high-performance and energy-efficient systems grows, Domain Specific Accelerator Architectures (DSAs) offer a promising solution by providing tailored hardware solutions that outperform general-purpose processors in specific tasks. The talk will cover the fundamental principles of DSA design, including architecture, optimization techniques, and practical applications for servicing LLMs.',
    bio: 'IEEE CASS Distinguished Lecturer. Works on error correction, storage-class memory and machine learning accelerators, with more than 100 U.S. patents. Chairs the IEEE P3109 working group on arithmetic for machine learning.',
  },
  jouppi: {
    name: 'Norm Jouppi',
    org: 'Google',
    logo: logo('google.svg'),
    photo: img('jouppi-2.jpg'),
    bio: 'Google Fellow who has helped lead Google’s Tensor Processing Units since the first generation. Member of the National Academy of Engineering. PhD, Stanford.',
  },
  park: {
    name: 'Youngsuk Park',
    org: 'AWS',
    logo: logo('aws.svg'),
    photo: img('park.jpg'),
    abstract:
      'AI progress is tied to the hardware it runs on, and the relationship now runs both ways. This talk compares GPUs, TPUs and AWS Trainium beyond raw FLOPS: memory hierarchy, interconnect and native number formats. It then covers algorithms built around those features, from low-precision training and stochastic rounding to communication-efficient optimizers, and closes with LLMs that write the kernels the stack runs on.',
    bio: 'Principal Scientist at AWS AI, leading the Core Algorithm research team at Annapurna Labs, which builds training and inference algorithms for AWS Trainium. Author of more than 35 papers at NeurIPS, ICML, ICLR and AISTATS. PhD, Stanford.',
  },
  kim: {
    name: 'Vincent (WooPoung) Kim',
    org: 'Samsung Semiconductor',
    logo: logo('samsung.svg'),
    photo: img('kim.jpg'),
    abstract:
      'As transistor scaling slows, 2.5D/3D advanced packaging has become a main driver of system-level performance, power efficiency and integration density. Tightly integrating multiple dies brings electrical, thermal and mechanical effects that cannot be solved separately. This talk reviews the challenges and emerging trends across simulation, manufacturing and reliability, and how those effects interact.',
    bio: 'Advisor for advanced packaging at Samsung Device Solutions Research America, where he led the packaging division. Earlier at Apple, Qualcomm, Texas Instruments and Rambus. PhD, Georgia Tech.',
  },
  lee: {
    name: 'Tom Lee',
    org: 'Stanford',
    logo: logo('stanford.svg'),
    photo: img('lee.jpg'),
    bio: 'Professor of Electrical Engineering. Wrote the standard text on CMOS RF design; co-founded Matrix Semiconductor and directed DARPA’s Microsystems Technology Office.',
  },
  nasrullah: {
    name: 'Jawad Nasrullah',
    org: 'Palo Alto Electron',
    logo: logo('pae.png'),
    photo: img('nasrullah-2.jpg'),
    bio: 'CEO of Palo Alto Electron. Co-leads the Open Compute Project’s Open Chiplet Economy effort; co-founded zGlue. PhD, Stanford.',
  },
}

// kind: 'talk' (default) | 'quiet' (welcome, breaks, meals) | 'tba' (title to come)
// tag: '' | 'Keynote' | 'Panel'. A row with `speakers` expands to show abstract and bios;
// `panel` lists the panelists shown in the face row; `logos` are their organizations.
export const aiComputeProgram = [
  { time: '9:00', title: 'Welcome', who: 'Ethan Song, Stanford IEEE · Kee-Bong Song, Samsung Semiconductor', kind: 'quiet' },
  { time: '9:15', title: 'Data Representations for AI Hardware', speakers: [SPEAKERS.tambe] },
  { time: '9:45', title: 'From KV Cache Offloading to Agent Workflow: How AI Memory Movement Works in System Software', speakers: [SPEAKERS.seo] },
  { time: '10:15', title: 'Domain Specific Accelerator Architectures for Servicing LLMs', speakers: [SPEAKERS.gunnam] },
  { time: '10:45', title: 'Break', kind: 'quiet' },
  { time: '11:15', title: 'Keynote', note: 'Title to come.', tag: 'Keynote', speakers: [SPEAKERS.jouppi] },
  { time: '12:00', title: 'From Silicon to Intelligence: Hardware, Algorithms and AI Co-Evolving at Scale', speakers: [SPEAKERS.park] },
  { time: '12:30', title: 'Lunch', kind: 'quiet' },
  { time: '1:30', title: 'Multi-physical Challenges and Trends of 2.5D/3D Advanced Packaging for High-Current AI Processor Stacks', speakers: [SPEAKERS.kim] },
  {
    time: '2:00',
    title: 'Orchestrating the stack',
    tag: 'Panel',
    who: 'Tom Lee and other panelists · moderated by Jawad Nasrullah',
    note: 'With audience Q&A.',
    speakers: [SPEAKERS.lee, SPEAKERS.nasrullah],
    panel: [SPEAKERS.lee, SPEAKERS.nasrullah],
    logos: [
      { src: logo('stanford.svg'), org: 'Stanford' },
      { src: logo('pae.png'), org: 'Palo Alto Electron' },
      { src: logo('samsung.svg'), org: 'Samsung Semiconductor' },
    ],
  },
  { time: '3:00', title: 'Closing Remarks', who: 'Nathan Chang and Elkim Roa Fuentes, Samsung Semiconductor', kind: 'quiet' },
]

export const aiComputeCommittee = [
  { name: 'Ethan Song', role: 'Chair, Stanford IEEE Student Branch' },
  { name: 'Kee-Bong Song', role: 'SVP and Head of System LSI Research Center, Samsung DSRA · IEEE Fellow' },
  { name: 'Nathan (Naehyuck) Chang', role: 'SVP, Samsung DSRA · IEEE Fellow, ACM Fellow' },
  { name: 'Elkim Roa Fuentes', role: 'SoC Architect, Samsung Semiconductor · IEEE CASS' },
  { name: 'Jawad Nasrullah', role: 'CEO, Palo Alto Electron' },
  { name: 'Rajiv Joshi', role: 'Research Staff Member, IBM T. J. Watson Research Center' },
]

// Practical details, shown as dropdowns at the foot of the page.
export const aiComputeInfo = [
  {
    title: 'Registration deadline',
    body: [
      `Register on Luma by ${aiComputeMeta.deadlineStr}. Seats are limited, so we review every registration and will email you by ${aiComputeMeta.deadlineStr} to confirm whether you have a seat.`,
    ],
  },
  {
    title: 'Coffee and breakfast',
    body: [
      'Check in at the door and you get a $15 voucher for Bytes Café, inside the Packard building next door to Allen. Spend it on coffee or breakfast whenever you like.',
      'Lunch is catered on site.',
    ],
  },
  {
    title: 'Parking',
    body: [
      'Park in the Via Ortega Garage on Via Ortega, a few minutes’ walk from Allen. Visitor parking is paid: use the ParkMobile app or a pay station in the garage.',
    ],
  },
]
