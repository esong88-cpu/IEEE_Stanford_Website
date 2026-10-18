/** Contact and social links shared by the home page, footer and New here page. */
export const BRANCH_EMAIL = 'ieee@ee.stanford.edu'
export const MAILING_LIST_URL = 'https://forms.gle/bCdLGNa4bYvpxj3f7'

// Links with an empty href are hidden until filled in.
export const SOCIAL_LINKS = [
  { label: 'YouTube', href: 'https://www.youtube.com/@StanfordIEEE' },
  { label: 'Instagram', href: 'https://www.instagram.com/ieee_stanford/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/stanford-ieee/' },
].filter((link) => link.href)

export const LUNCH_AND_LEARN_MAILTO = `mailto:${BRANCH_EMAIL}?subject=${encodeURIComponent('Hosting a Lunch & Learn')}`
