export interface SeoMetadata {
  label: string;
  title: string;
  description: string;
  path: string;
  ogImage: string;
}

const canonicalBaseUrl = 'https://serhatsoruklu.com';
const defaultOgImage = '/assets/social/serhat-soruklu-og.svg';
const defaultPersonImage = '/assets/portfolio-image/serhat-soruklu-portrait-818.jpg';

export const pageSeoMetadata = {
  home: {
    label: 'Home',
    title: 'Systems Architect | Serhat Soruklu',
    description: 'Systems architecture, software engineering, and modern digital infrastructure built with precision, scale, and long-term thinking.',
    path: '/',
    ogImage: defaultOgImage
  },
  work: {
    label: 'Work',
    title: 'Work | Serhat Soruklu',
    description: 'Production work by Serhat Soruklu across product architecture, full-stack delivery, infrastructure ownership, SEO surfaces, and long-term maintenance.',
    path: '/work',
    ogImage: '/assets/social/serhat-soruklu-work-og.svg'
  },
  systems: {
    label: 'Systems',
    title: 'Systems | Serhat Soruklu',
    description: 'Explore Serhat Soruklu\'s systems map across Coupyn, ChatPDM, DBF, CIM, production platforms, research, and architecture models.',
    path: '/systems',
    ogImage: '/assets/social/serhat-soruklu-systems-og.svg'
  },
  coupynSystem: {
    label: 'Coupyn',
    title: 'Coupyn System | Serhat Soruklu',
    description: 'Coupyn is Serhat Soruklu\'s production commerce system for coupon and referral discovery, company pages, trust signals, and durable SEO visibility.',
    path: '/systems/coupyn',
    ogImage: '/assets/social/serhat-soruklu-systems-coupyn-og.svg'
  },
  chatpdmSystem: {
    label: 'ChatPDM',
    title: 'ChatPDM System | Serhat Soruklu',
    description: 'ChatPDM is Serhat Soruklu\'s deterministic language governance system for bounded concepts, refusal-first resolution, and semantic drift prevention.',
    path: '/systems/chatpdm',
    ogImage: '/assets/social/serhat-soruklu-systems-chatpdm-og.svg'
  },
  dbfSystem: {
    label: 'DBF',
    title: 'DBF System | Serhat Soruklu',
    description: 'Deterministic Boundary Firewall is Serhat Soruklu\'s research system for bounded pre-egress checks, refusal payloads, MCP parity, and drift-safe gates.',
    path: '/systems/deterministic-boundary-firewall',
    ogImage: '/assets/social/serhat-soruklu-systems-dbf-og.svg'
  },
  cimSystem: {
    label: 'CIM',
    title: 'CIM System | Serhat Soruklu',
    description: 'Continuity Identity Model is Serhat Soruklu\'s deterministic protocol for identity continuity, state change, and inherited authority in machine actors.',
    path: '/systems/continuity-identity-model',
    ogImage: '/assets/social/serhat-soruklu-systems-cim-og.svg'
  },
  writing: {
    label: 'Writing',
    title: 'Writing | Serhat Soruklu',
    description: 'Essays and technical writing on software, systems, architecture, execution, and long-term digital thinking.',
    path: '/writing',
    ogImage: '/assets/social/serhat-soruklu-writing-og.svg'
  },
  github: {
    label: 'GitHub',
    title: 'GitHub | Serhat Soruklu',
    description: 'Open-source projects, repositories, experiments, and engineering work by Serhat Soruklu on GitHub.',
    path: '/github',
    ogImage: '/assets/social/serhat-soruklu-github-og.svg'
  },
  contact: {
    label: 'Contact',
    title: 'Contact | Serhat Soruklu',
    description: 'Contact Serhat Soruklu for collaborations, systems architecture, engineering discussions, and project inquiries.',
    path: '/contact',
    ogImage: '/assets/social/serhat-soruklu-contact-og.svg'
  }
} as const satisfies Record<string, SeoMetadata>;

export const seoConfig = {
  siteName: 'Serhat Soruklu',
  defaultTitle: pageSeoMetadata.home.title,
  defaultDescription: pageSeoMetadata.home.description,
  canonicalBaseUrl,
  defaultOgImage,
  defaultPersonImage,
  twitterHandle: '',
  authorName: 'Serhat Soruklu',
  defaultLocale: 'en_GB'
} as const;
