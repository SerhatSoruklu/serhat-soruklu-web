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
export type StructuredDataProfile = 'breadcrumb' | 'soruklu-order' | 'velari' | 'none';

const canonicalBaseUrl = 'https://serhatsoruklu.com';
const defaultOgImage = '/assets/social/serhat-soruklu-og.png';
const defaultPersonImage = '/assets/portfolio-image/serhat-soruklu-portrait-818.jpg';
const rasterSocialImage = {
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
} as const;

export const pageSeoMetadata = {
  home: {
    label: 'Home',
    title: 'Systems Architect | Serhat Soruklu',
    description:
      'Systems architecture, software engineering, and modern digital infrastructure built with precision, scale, and long-term thinking.',
    path: '/',
    ogImage: defaultOgImage,
    ogImageAlt: 'Serhat Soruklu systems architect identity in deep navy and gold.',
    ...rasterSocialImage,
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
    label: 'DBF',
    title: 'DBF System | Serhat Soruklu',
    description:
      "Deterministic Boundary Firewall is Serhat Soruklu's research system for bounded pre-egress checks, refusal payloads, MCP parity, and drift-safe gates.",
    path: '/systems/deterministic-boundary-firewall',
    ogImage: '/assets/social/serhat-soruklu-systems-dbf-og.png',
    ogImageAlt: 'Deterministic Boundary Firewall system by Serhat Soruklu.',
    ...rasterSocialImage,
  },
  cimSystem: {
    label: 'CIM',
    title: 'CIM System | Serhat Soruklu',
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
  sorukluOrder: {
    label: 'Soruklu Order',
    title: 'The Soruklu Order | Official Family Initiative',
    description:
      'Official page of the Soruklu Order, a small voluntary family initiative founded by Serhat Soruklu around discipline, continuity and responsibility.',
    path: '/soruklu-order',
    ogImage: '/assets/social/serhat-soruklu-soruklu-order-og.png',
    ogImageAlt: 'The Soruklu Order emblem and identity in black and gold.',
    ...rasterSocialImage,
    robots: 'index, follow',
    structuredData: 'soruklu-order',
  },
  velari: {
    label: 'Velari',
    title: 'Velari | Light, Discipline and Responsibility',
    description:
      'Velari is a voluntary spiritual philosophy founded by Serhat Soruklu, centred on Light, discipline, compassion, truth, free will and responsibility.',
    path: '/velari',
    ogImage: '/assets/social/serhat-soruklu-velari-og.png',
    ogImageAlt: 'Velari emblem with the words A path of Light, wisdom and discipline.',
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
    description: 'The requested page could not be found. Return home or continue to the systems overview.',
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
