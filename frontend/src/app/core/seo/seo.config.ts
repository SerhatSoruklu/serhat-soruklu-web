export interface SeoMetadata {
  label: string;
  title: string;
  description: string;
  path: string;
}

const canonicalBaseUrl = 'https://serhatsoruklu.com';
const defaultOgImage = '/assets/social/serhat-soruklu-og.svg';

export const pageSeoMetadata = {
  home: {
    label: 'Home',
    title: 'Serhat Soruklu | Systems Architect',
    description: 'Systems architecture, software engineering, and modern digital infrastructure built with precision, scale, and long-term thinking.',
    path: '/'
  },
  work: {
    label: 'Work',
    title: 'Serhat Soruklu | Work',
    description: 'Explore projects, platforms, and systems focused on architecture, scalability, performance, and execution.',
    path: '/work'
  },
  systems: {
    label: 'Systems',
    title: 'Serhat Soruklu | Systems',
    description: 'Structured thinking on systems architecture, infrastructure, engineering patterns, and scalable digital design.',
    path: '/systems'
  },
  writing: {
    label: 'Writing',
    title: 'Serhat Soruklu | Writing',
    description: 'Essays and technical writing on software, systems, architecture, execution, and long-term digital thinking.',
    path: '/writing'
  },
  github: {
    label: 'GitHub',
    title: 'Serhat Soruklu | GitHub',
    description: 'Open-source projects, repositories, experiments, and engineering work by Serhat Soruklu on GitHub.',
    path: '/github'
  },
  contact: {
    label: 'Contact',
    title: 'Serhat Soruklu | Contact',
    description: 'Contact Serhat Soruklu for collaborations, systems architecture, engineering discussions, and project inquiries.',
    path: '/contact'
  }
} as const satisfies Record<string, SeoMetadata>;

export const seoConfig = {
  siteName: 'Serhat Soruklu',
  defaultTitle: pageSeoMetadata.home.title,
  defaultDescription: pageSeoMetadata.home.description,
  canonicalBaseUrl,
  defaultOgImage,
  twitterHandle: '',
  authorName: 'Serhat Soruklu',
  defaultLocale: 'en_GB'
} as const;
