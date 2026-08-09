import {
  FOUNDER_PORTRAITS,
  FOUNDER_PORTRAIT_HEIGHT,
  FOUNDER_PORTRAIT_WIDTH,
} from '../../shared/portraits/founder-portrait.config';

export interface PressFact {
  readonly label: string;
  readonly value: string;
  readonly url?: string;
}

export interface PressFactSheet {
  readonly index: string;
  readonly title: string;
  readonly facts: readonly PressFact[];
}

export interface PressBiography {
  readonly label: string;
  readonly text: string;
}

export interface PressPhotographyAsset {
  readonly alt: string;
  readonly assetLabel: string;
  readonly fileName: string;
  readonly fileSize: string;
  readonly format: 'PNG';
  readonly height: number;
  readonly provenance?: string;
  readonly src: string;
  readonly title: string;
  readonly width: number;
}

export interface PressMediaFormat {
  readonly action: string;
  readonly dimensions: string;
  readonly fileName: string;
  readonly fileSize: string;
  readonly format: 'PNG' | 'SVG';
  readonly openInNewTab: boolean;
  readonly path: string;
}

export interface PressSystem {
  readonly description: string;
  readonly index: string;
  readonly path: string;
  readonly title: string;
}

export interface PressVerificationLink {
  readonly description: string;
  readonly name: string;
  readonly rel: 'me noopener noreferrer' | 'noopener noreferrer';
  readonly sourceType: string;
  readonly url: string;
}

const founderWorkstationProvenance =
  'AI-assisted edited photograph. The person shown is Serhat Soruklu. Only his face was regenerated from his supplied portrait reference; the underlying body, workstation and background are real. Embedded Content Credentials identify trained algorithmic media created with gpt-image 2.0.';

export const pressContent = {
  hero: {
    eyebrow: 'PRESS / MEDIA',
    title: 'Serhat Soruklu & Coupyn',
    lead: 'Verified facts, biographies, images and background material for journalists, researchers and media enquiries.',
    supporting:
      'This page provides first-party reference material for coverage of Serhat Soruklu, Coupyn and related technical work. Public verification and reference links are included where available.',
    dossierLabel: 'REFERENCE DOSSIER',
    dossierId: 'PRESS / 001',
    dossierItems: [
      { label: 'Scope', value: 'Serhat Soruklu + Coupyn' },
      { label: 'Source', value: 'First-party reference material' },
      { label: 'Language', value: 'English / United Kingdom' },
      { label: 'Updated', value: '9 August 2026' },
    ],
  },
  factSheets: [
    {
      index: '01',
      title: 'Serhat Soruklu',
      facts: [
        { label: 'Full name', value: 'Serhat Soruklu' },
        { label: 'Born', value: '22 February 1996' },
        { label: 'Birthplace', value: 'Osmancık, Çorum, Turkey' },
        { label: 'Raised in', value: 'Tottenham, London' },
        { label: 'Based in', value: 'London, United Kingdom' },
        {
          label: 'Occupation',
          value: 'Software developer, systems architect and entrepreneur',
        },
        { label: 'Role', value: 'Founder & CEO of Coupyn' },
        {
          label: 'Personal website',
          value: 'serhatsoruklu.com',
          url: 'https://serhatsoruklu.com/',
        },
      ],
    },
    {
      index: '02',
      title: 'Coupyn',
      facts: [
        { label: 'Name', value: 'Coupyn' },
        { label: 'Started', value: '2023' },
        { label: 'Legal entity', value: 'Coupyn Ltd' },
        { label: 'Company number', value: '16939840' },
        { label: 'Incorporated', value: '2 January 2026' },
        { label: 'Country', value: 'United Kingdom' },
        { label: 'Platform', value: 'Coupon, referral and affiliate intelligence' },
        { label: 'Scale', value: 'Roughly 1 million company pages' },
        { label: 'Website', value: 'coupyn.com', url: 'https://coupyn.com/' },
      ],
    },
  ] satisfies readonly PressFactSheet[],
  biographies: [
    {
      label: '50-WORD BIO',
      text: 'Serhat Soruklu is a London-based software developer, systems architect and entrepreneur. Born in Osmancık, Turkey, and raised in Tottenham, he is the founder and CEO of Coupyn, a coupon, referral and affiliate intelligence platform that he has built and operated independently.',
    },
    {
      label: '100-WORD BIO',
      text: 'Serhat Soruklu is a London-based software developer, systems architect and entrepreneur. Born in Osmancık, Çorum, Turkey, he moved to London at the age of two and grew up in Tottenham. His technical background developed through years of self-directed work with computers, private game servers, web development and infrastructure. He began building Coupyn in 2023 and now operates the platform independently across frontend development, backend services, data, technical SEO, security and infrastructure. His public technical work also includes ChatPDM, Deterministic Boundary Firewall and Continuity Identity Model.',
    },
  ] satisfies readonly PressBiography[],
  photography: [
    {
      title: 'Portrait',
      src: '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png',
      alt: 'Portrait of Serhat Soruklu, founder and CEO of Coupyn.',
      assetLabel: 'PORTRAIT',
      width: 1173,
      height: 1341,
      format: 'PNG',
      fileSize: '547.3 KiB',
      fileName: 'serhat-soruklu-ceo-founder-of-coupyn.png',
    },
    {
      title: 'Founder workstation visual — light',
      src: FOUNDER_PORTRAITS.light.src,
      alt: 'AI-assisted edited photograph of Serhat Soruklu at his bright workstation.',
      assetLabel: 'AI-ASSISTED PHOTOGRAPH',
      width: FOUNDER_PORTRAIT_WIDTH,
      height: FOUNDER_PORTRAIT_HEIGHT,
      format: 'PNG',
      fileSize: '1.90 MiB',
      fileName: 'serhat-soruklu-founder-light.png',
      provenance: founderWorkstationProvenance,
    },
    {
      title: 'Founder workstation visual — dark',
      src: FOUNDER_PORTRAITS.dark.src,
      alt: 'AI-assisted edited photograph of Serhat Soruklu at his dark workstation.',
      assetLabel: 'AI-ASSISTED PHOTOGRAPH',
      width: FOUNDER_PORTRAIT_WIDTH,
      height: FOUNDER_PORTRAIT_HEIGHT,
      format: 'PNG',
      fileSize: '1.65 MiB',
      fileName: 'serhat-soruklu-founder-dark.png',
      provenance: founderWorkstationProvenance,
    },
  ] satisfies readonly PressPhotographyAsset[],
  coupynMedia: {
    title: 'Coupyn system media graphic',
    description:
      'Current first-party system artwork for Coupyn, available in raster and vector formats.',
    previewSrc: '/assets/social/serhat-soruklu-systems-coupyn-og.png',
    previewAlt:
      'Coupyn system media graphic describing commerce infrastructure for trust and referral discovery.',
    previewWidth: 1200,
    previewHeight: 630,
    formats: [
      {
        action: 'Open full-resolution PNG',
        dimensions: '1200 × 630',
        fileName: 'serhat-soruklu-systems-coupyn-og.png',
        fileSize: '189.3 KiB',
        format: 'PNG',
        openInNewTab: true,
        path: '/assets/social/serhat-soruklu-systems-coupyn-og.png',
      },
      {
        action: 'Download SVG source',
        dimensions: '1200 × 630',
        fileName: 'serhat-soruklu-systems-coupyn-og.svg',
        fileSize: '9.3 KiB',
        format: 'SVG',
        openInNewTab: false,
        path: '/assets/social/serhat-soruklu-systems-coupyn-og.svg',
      },
    ] satisfies readonly PressMediaFormat[],
  },
  coupyn: {
    description:
      'Coupyn is a coupon, referral and affiliate intelligence platform that organises offers and company information across a large public directory. Serhat Soruklu began building the platform in 2023 and continues to build and operate it independently.',
    technicalContext: [
      'Angular',
      'Node.js',
      'Express',
      'MongoDB',
      'Technical SEO',
      'Self-managed infrastructure',
    ],
  },
  systems: [
    {
      index: '01',
      title: 'Coupyn',
      description: 'Production coupon, referral and affiliate intelligence platform.',
      path: '/systems/coupyn',
    },
    {
      index: '02',
      title: 'ChatPDM',
      description:
        'A deterministic concept system for authored, versioned meaning and bounded resolution.',
      path: '/systems/chatpdm',
    },
    {
      index: '03',
      title: 'Deterministic Boundary Firewall',
      description:
        'A bounded pre-egress security experiment for inspecting requests before model or tool execution.',
      path: '/systems/deterministic-boundary-firewall',
    },
    {
      index: '04',
      title: 'Continuity Identity Model',
      description:
        'A protocol workspace exploring identity, authority and responsibility across machine state changes.',
      path: '/systems/continuity-identity-model',
    },
  ] satisfies readonly PressSystem[],
  verification: [
    {
      sourceType: 'OFFICIAL COMPANY RECORD',
      name: 'Companies House',
      description: 'Coupyn Ltd · Company 16939840',
      url: 'https://find-and-update.company-information.service.gov.uk/company/16939840',
      rel: 'noopener noreferrer',
    },
    {
      sourceType: 'PUBLIC CODE',
      name: 'GitHub',
      description: 'Public repositories and technical work',
      url: 'https://github.com/SerhatSoruklu',
      rel: 'me noopener noreferrer',
    },
    {
      sourceType: 'PERSISTENT RESEARCH IDENTIFIER',
      name: 'ORCID',
      description: '0009-0006-8963-5986',
      url: 'https://orcid.org/0009-0006-8963-5986',
      rel: 'me noopener noreferrer',
    },
    {
      sourceType: 'PROFESSIONAL PROFILE',
      name: 'LinkedIn',
      description: 'Serhat Soruklu professional profile',
      url: 'https://www.linkedin.com/in/serhatsoruklu/',
      rel: 'me noopener noreferrer',
    },
    {
      sourceType: 'OFFICIAL PLATFORM',
      name: 'Coupyn',
      description: 'Public platform operated by Coupyn Ltd',
      url: 'https://coupyn.com/',
      rel: 'noopener noreferrer',
    },
    {
      sourceType: 'PRIMARY FIRST-PARTY WEBSITE',
      name: 'SerhatSoruklu.com',
      description: 'Official personal website',
      url: 'https://serhatsoruklu.com/',
      rel: 'me noopener noreferrer',
    },
  ] satisfies readonly PressVerificationLink[],
} as const;
