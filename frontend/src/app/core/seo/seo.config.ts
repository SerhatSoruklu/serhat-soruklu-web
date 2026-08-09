export interface SeoMetadata {
  label: string;
  title: string;
  description: string;
  path: string;
  ogImage: string;
  ogImageAlt?: string;
  ogImageHeight?: number;
  ogImageType?: string;
  ogImageWidth?: number;
  robots?: RobotsDirective;
  structuredData?: StructuredDataProfile;
}

export type RobotsDirective = 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
export type StructuredDataProfile =
  | 'about'
  | 'breadcrumb'
  | 'press'
  | 'soruklu-surname'
  | 'soruklu-order'
  | 'velari'
  | 'none';

const canonicalBaseUrl = 'https://serhatsoruklu.com';
const defaultOgImage = '/assets/social/serhat-soruklu-og.png';
const defaultPersonImage = '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png';
const rasterSocialImage = {
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
} as const;

export const pageSeoMetadata = {
  home: {
    label: 'Home',
    title: 'Serhat Soruklu | Systems Architect & Founder',
    description:
      'Serhat Soruklu is the founder and CEO of Coupyn, a systems architect and solo full-stack developer building production platforms and infrastructure.',
    path: '/',
    ogImage: defaultOgImage,
    ogImageAlt: 'Serhat Soruklu systems architect identity in deep navy and gold.',
    ...rasterSocialImage,
  },
  about: {
    label: 'About',
    title: 'About Serhat Soruklu | Founder & CEO of Coupyn',
    description:
      'Serhat Soruklu is a London-based software developer and founder of Coupyn. Read his journey from Osmancık and Tottenham to production-scale systems.',
    path: '/about',
    ogImage: '/assets/social/serhat-soruklu-about-og.png',
    ogImageAlt:
      'Portrait of Serhat Soruklu, founder and CEO of Coupyn, alongside his journey from Osmancık and Tottenham to building production systems.',
    ...rasterSocialImage,
    robots: 'index, follow',
    structuredData: 'about',
  },
  press: {
    label: 'Press / Media',
    title: 'Press & Media | Serhat Soruklu',
    description:
      'Verified biographies, company facts, media assets and public reference links for coverage of Serhat Soruklu and Coupyn.',
    path: '/press',
    ogImage: '/assets/social/serhat-soruklu-press-og.png',
    ogImageAlt:
      'Serhat Soruklu press and media reference card with his portrait and Founder and CEO of Coupyn title.',
    ...rasterSocialImage,
    robots: 'index, follow',
    structuredData: 'press',
  },
  work: {
    label: 'Work',
    title: 'Work | Serhat Soruklu',
    description:
      'Production work by Serhat Soruklu across product architecture, full-stack delivery, infrastructure ownership, SEO surfaces, and long-term maintenance.',
    path: '/work',
    ogImage: '/assets/social/serhat-soruklu-work-og.png',
    ogImageAlt: 'Serhat Soruklu work portfolio in deep navy and gold.',
    ...rasterSocialImage,
  },
  systems: {
    label: 'Systems',
    title: 'Systems | Serhat Soruklu',
    description:
      "Explore Serhat Soruklu's systems map across Coupyn, ChatPDM, DBF, CIM, production platforms, research, and architecture models.",
    path: '/systems',
    ogImage: '/assets/social/serhat-soruklu-systems-og.png',
    ogImageAlt: 'Serhat Soruklu systems architecture map in deep navy and gold.',
    ...rasterSocialImage,
  },
  coupynSystem: {
    label: 'Coupyn',
    title: 'Coupyn System | Serhat Soruklu',
    description:
      "Coupyn is Serhat Soruklu's production commerce system for coupon and referral discovery, company pages, trust signals, and durable SEO visibility.",
    path: '/systems/coupyn',
    ogImage: '/assets/social/serhat-soruklu-systems-coupyn-og.png',
    ogImageAlt: 'Coupyn system architecture by Serhat Soruklu.',
    ...rasterSocialImage,
  },
  chatpdmSystem: {
    label: 'ChatPDM',
    title: 'ChatPDM System | Serhat Soruklu',
    description:
      "ChatPDM is Serhat Soruklu's deterministic language governance system for bounded concepts, refusal-first resolution, and semantic drift prevention.",
    path: '/systems/chatpdm',
    ogImage: '/assets/social/serhat-soruklu-systems-chatpdm-og.png',
    ogImageAlt: 'ChatPDM deterministic governance system by Serhat Soruklu.',
    ...rasterSocialImage,
  },
  dbfSystem: {
    label: 'Deterministic Boundary Firewall',
    title: 'Deterministic Boundary Firewall | Serhat Soruklu',
    description:
      "Deterministic Boundary Firewall is Serhat Soruklu's research system for bounded pre-egress checks, refusal payloads, MCP parity, and drift-safe gates.",
    path: '/systems/deterministic-boundary-firewall',
    ogImage: '/assets/social/serhat-soruklu-systems-dbf-og.png',
    ogImageAlt: 'Deterministic Boundary Firewall system by Serhat Soruklu.',
    ...rasterSocialImage,
  },
  cimSystem: {
    label: 'Continuity Identity Model',
    title: 'Continuity Identity Model | Serhat Soruklu',
    description:
      "Continuity Identity Model is Serhat Soruklu's deterministic protocol for identity continuity, state change, and inherited authority in machine actors.",
    path: '/systems/continuity-identity-model',
    ogImage: '/assets/social/serhat-soruklu-systems-cim-og.png',
    ogImageAlt: 'Continuity Identity Model system by Serhat Soruklu.',
    ...rasterSocialImage,
  },
  writing: {
    label: 'Writing',
    title: 'Writing | Serhat Soruklu',
    description:
      'Essays and field notes by Serhat Soruklu on systems architecture, infrastructure, product trust, deterministic software, and building Coupyn.',
    path: '/writing',
    ogImage: '/assets/social/serhat-soruklu-writing-og.png',
    ogImageAlt: 'Serhat Soruklu systems notebook in deep navy and gold.',
    ...rasterSocialImage,
  },
  github: {
    label: 'GitHub',
    title: 'GitHub | Serhat Soruklu',
    description:
      'Public repositories by Serhat Soruklu covering ChatPDM, deterministic systems, bounded architecture, continuity research, and engineering practice.',
    path: '/github',
    ogImage: '/assets/social/serhat-soruklu-github-og.png',
    ogImageAlt: 'Serhat Soruklu public GitHub engineering record.',
    ...rasterSocialImage,
  },
  sorukluSurname: {
    label: 'Soruklu surname',
    title: 'Soruklu Surname: Meaning and Origin | Serhat Soruklu',
    description:
      'Explore Soruklu as Soruk + -lu through Ottoman place records, pre-1934 personal use, regional evidence, and clear limits on ancestry claims.',
    path: '/soruklu-surname',
    ogImage: '/assets/social/serhat-soruklu-soruklu-surname-og.png',
    ogImageAlt: 'Soruklu surname formation shown as Soruk plus the Turkish suffix -lu.',
    ...rasterSocialImage,
    robots: 'index, follow',
    structuredData: 'soruklu-surname',
  },
  sorukluOrder: {
    label: 'Soruklu Order',
    title: 'The Soruklu Order | Family Stewardship Initiative',
    description:
      'The Soruklu Order is a small, voluntary family stewardship initiative for authorised records, mutual support, responsible conduct, and continuity.',
    path: '/soruklu-order',
    ogImage: '/assets/social/serhat-soruklu-soruklu-order-og.png',
    ogImageAlt: 'The Soruklu Order family stewardship initiative and interwoven family emblem.',
    ...rasterSocialImage,
    robots: 'index, follow',
    structuredData: 'soruklu-order',
  },
  velari: {
    label: 'Velari',
    title: 'Velari | Personal Belief Framework and Writing Project',
    description:
      'Velari is Serhat Soruklu’s evolving personal belief framework and writing project exploring Helio-pantheism, Light, discipline and responsibility.',
    path: '/velari',
    ogImage: '/assets/social/serhat-soruklu-velari-og.png',
    ogImageAlt: 'Velari symbol alongside the words A modern belief framework and Helio-pantheism.',
    ...rasterSocialImage,
    robots: 'index, follow',
    structuredData: 'velari',
  },
  contact: {
    label: 'Contact',
    title: 'Contact | Serhat Soruklu',
    description:
      'Contact Serhat Soruklu for collaborations, systems architecture, engineering discussions, and project inquiries.',
    path: '/contact',
    ogImage: '/assets/social/serhat-soruklu-contact-og.png',
    ogImageAlt: 'Contact Serhat Soruklu for focused systems and engineering discussions.',
    ...rasterSocialImage,
  },
  notFound: {
    label: 'Page not found',
    title: 'Page Not Found | Serhat Soruklu',
    description:
      'The requested page could not be found. Return home or continue to the systems overview.',
    path: '/404',
    ogImage: defaultOgImage,
    ogImageAlt: 'Serhat Soruklu systems architect identity in deep navy and gold.',
    ...rasterSocialImage,
    robots: 'noindex, follow',
    structuredData: 'none',
  },
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
  defaultLocale: 'en_GB',
} as const;
