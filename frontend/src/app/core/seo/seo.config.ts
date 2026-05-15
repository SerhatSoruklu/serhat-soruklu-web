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
    title: 'Serhat Soruklu | Systems Architect',
    description: 'Systems architecture, software engineering, and modern digital infrastructure built with precision, scale, and long-term thinking.',
    path: '/',
    ogImage: defaultOgImage
  },
  work: {
    label: 'Work',
    title: 'Serhat Soruklu | Work',
    description: 'Production work by Serhat Soruklu across product architecture, full-stack delivery, infrastructure ownership, SEO surfaces, and long-term system maintenance.',
    path: '/work',
    ogImage: '/assets/social/serhat-soruklu-work-og.svg'
  },
  systems: {
    label: 'Systems',
    title: 'Serhat Soruklu | Systems',
    description: 'Structured thinking on systems architecture, infrastructure, engineering patterns, and scalable digital design.',
    path: '/systems',
    ogImage: '/assets/social/serhat-soruklu-systems-og.svg'
  },
  coupynSystem: {
    label: 'Coupyn',
    title: 'Serhat Soruklu | Coupyn System',
    description: 'Outcome-driven commerce infrastructure for trust, referral discovery, and scalable marketplace signals.',
    path: '/systems/coupyn',
    ogImage: '/assets/social/serhat-soruklu-systems-coupyn-og.svg'
  },
  chatpdmSystem: {
    label: 'ChatPDM',
    title: 'Serhat Soruklu | ChatPDM System',
    description: 'Deterministic language governance built to resolve, refuse, and prevent semantic drift.',
    path: '/systems/chatpdm',
    ogImage: '/assets/social/serhat-soruklu-systems-chatpdm-og.svg'
  },
  dbfSystem: {
    label: 'DBF',
    title: 'Serhat Soruklu | DBF System',
    description: 'A bounded deterministic pre-egress firewall research artifact using BoundaryGate, refusal payloads, MCP parity, attack-surface testing, and release-gate checks.',
    path: '/systems/deterministic-boundary-firewall',
    ogImage: '/assets/social/serhat-soruklu-systems-dbf-og.svg'
  },
  cimSystem: {
    label: 'CIM',
    title: 'Serhat Soruklu | CIM System',
    description: 'A deterministic continuity protocol for evaluating whether a changed machine actor remains eligible to inherit previously granted authority.',
    path: '/systems/continuity-identity-model',
    ogImage: '/assets/social/serhat-soruklu-systems-cim-og.svg'
  },
  writing: {
    label: 'Writing',
    title: 'Serhat Soruklu | Writing',
    description: 'Essays and technical writing on software, systems, architecture, execution, and long-term digital thinking.',
    path: '/writing',
    ogImage: '/assets/social/serhat-soruklu-writing-og.svg'
  },
  github: {
    label: 'GitHub',
    title: 'Serhat Soruklu | GitHub',
    description: 'Open-source projects, repositories, experiments, and engineering work by Serhat Soruklu on GitHub.',
    path: '/github',
    ogImage: '/assets/social/serhat-soruklu-github-og.svg'
  },
  contact: {
    label: 'Contact',
    title: 'Serhat Soruklu | Contact',
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
