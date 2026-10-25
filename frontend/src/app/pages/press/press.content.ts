import {
  FOUNDER_PORTRAITS,
  FOUNDER_PORTRAIT_HEIGHT,
  FOUNDER_PORTRAIT_WIDTH,
} from '../../shared/portraits/founder-portrait.config';
import { ORIGINAL_PORTRAIT } from '../../shared/portraits/original-portrait.config';
import { PROFILE_PORTRAITS } from '../../shared/portraits/profile-portraits.config';

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
  readonly previewSrc: string;
  readonly avifSrcset: string;
  readonly webpSrcset: string;
  readonly export8k: {
    readonly src: string;
    readonly fileName: string;
    readonly fileSize: string;
  } | null;
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
  'AI-assisted office composite, created on 24 October 2026 with OpenAI image generation using Serhat’s original selfie and real workspace. Native output: 1846 × 852; not an unaltered photograph.';

export const pressContent = {
  hero: {
    eyebrow: 'PRESS / MEDIA',
    title: 'Serhat Soruklu & Coupyn',
    lead: 'Reference facts, biographies, images and background material for journalists, researchers and media enquiries.',
    supporting:
      'This page provides first-party reference material for coverage of Serhat Soruklu, Coupyn, Stervox, CODARIS and related technical work. Public verification and reference links are included where available.',
    dossierLabel: 'REFERENCE DOSSIER',
    dossierId: 'PRESS / 001',
    dossierItems: [
      { label: 'Scope', value: 'Serhat Soruklu + Coupyn + Stervox + CODARIS' },
      { label: 'Source', value: 'First-party reference material' },
      { label: 'Language', value: 'English / United Kingdom' },
      { label: 'Updated', value: '25 October 2026' },
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
    {
      index: '03',
      title: 'STERVOX',
      facts: [
        { label: 'Name', value: 'STERVOX' },
        { label: 'Legal entity', value: 'STERVOX LIMITED' },
        { label: 'Company number', value: '17514320' },
        { label: 'Incorporated', value: '12 October 2026' },
        { label: 'Country', value: 'United Kingdom' },
        { label: 'Founder', value: 'Serhat Soruklu' },
        { label: 'Status', value: 'Pre launch · Architecture and foundation development' },
        { label: 'Focus', value: 'Financial technology, open finance and financial infrastructure' },
        { label: 'Website', value: 'stervox.com', url: 'https://stervox.com' },
      ],
    },
    {
      index: '04',
      title: 'CODARIS',
      facts: [
        { label: 'Name', value: 'CODARIS' },
        { label: 'Meaning', value: 'Coalition Of Developers Advancing Responsible Intelligent Systems' },
        { label: 'Status', value: 'Independent developer coalition · early-stage Beta V1' },
        { label: 'Focus', value: 'Practical work on responsible intelligent systems, security, safety, interoperability, and evidence' },
        { label: 'Website', value: 'codaris.org', url: 'https://codaris.org/' },
        { label: 'Public source', value: 'github.com/SerhatSoruklu/codaris', url: 'https://github.com/SerhatSoruklu/codaris' },
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
      text: 'Serhat Soruklu is a London-based software developer, systems architect and entrepreneur. Born in Osmancık, Turkey, and raised in Tottenham, he began building Coupyn in 2023 and independently operates its frontend, backend, data, technical SEO and infrastructure. He is also building Stervox, an ambitious financial platform with an in-house VOXCORE foundation, a planned launch on 5 January 2027 and a roadmap through 2036. Stervox remains in architecture and foundation development; its production financial core is not implemented. His other technical work includes CODARIS, ChatPDM, Deterministic Boundary Firewall and Continuity Identity Model, exploring responsible systems, explicit boundaries and continuity under operational pressure.',
    },
  ] satisfies readonly PressBiography[],
  photography: [
    {
      title: 'Original selfie',
      src: ORIGINAL_PORTRAIT.original,
      previewSrc: ORIGINAL_PORTRAIT.src,
      avifSrcset: ORIGINAL_PORTRAIT.avifSrcset,
      webpSrcset: ORIGINAL_PORTRAIT.webpSrcset,
      alt: 'Original selfie of Serhat Soruklu, founder and CEO of Coupyn.',
      assetLabel: 'ORIGINAL PHOTOGRAPH',
      width: ORIGINAL_PORTRAIT.width,
      height: ORIGINAL_PORTRAIT.height,
      format: 'PNG',
      fileSize: '2.68 MiB',
      fileName: 'serhat-soruklu-real-selfie.png',
      provenance: 'The supplied original selfie, preserved unchanged. The download is the original PNG; previews are optimised display copies.',
      export8k: null,
    },
    {
      title: 'Founder workstation visual — light',
      src: FOUNDER_PORTRAITS.light.nativeSrc,
      previewSrc: FOUNDER_PORTRAITS.light.src,
      avifSrcset: FOUNDER_PORTRAITS.light.avifSrcSet,
      webpSrcset: FOUNDER_PORTRAITS.light.srcSet,
      alt: 'AI-assisted image of Serhat Soruklu at his workstation, supplied for the light theme.',
      assetLabel: 'AI-ASSISTED PHOTOGRAPH',
      width: FOUNDER_PORTRAIT_WIDTH,
      height: FOUNDER_PORTRAIT_HEIGHT,
      format: 'PNG',
      fileSize: '2.00 MiB',
      fileName: 'serhat-soruklu-office-light-native.png',
      provenance: founderWorkstationProvenance,
      export8k: {
        src: FOUNDER_PORTRAITS.light.export8kSrc,
        fileName: 'serhat-soruklu-office-light-8k.png',
        fileSize: '12.79 MiB',
      },
    },
    {
      title: 'Founder workstation visual — dark',
      src: FOUNDER_PORTRAITS.dark.nativeSrc,
      previewSrc: FOUNDER_PORTRAITS.dark.src,
      avifSrcset: FOUNDER_PORTRAITS.dark.avifSrcSet,
      webpSrcset: FOUNDER_PORTRAITS.dark.srcSet,
      alt: 'AI-assisted image of Serhat Soruklu at his workstation, supplied for the dark theme.',
      assetLabel: 'AI-ASSISTED PHOTOGRAPH',
      width: FOUNDER_PORTRAIT_WIDTH,
      height: FOUNDER_PORTRAIT_HEIGHT,
      format: 'PNG',
      fileSize: '1.88 MiB',
      fileName: 'serhat-soruklu-office-dark-native.png',
      provenance: founderWorkstationProvenance,
      export8k: {
        src: FOUNDER_PORTRAITS.dark.export8kSrc,
        fileName: 'serhat-soruklu-office-dark-8k.png',
        fileSize: '11.45 MiB',
      },
    },
    ...PROFILE_PORTRAITS,
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
        fileSize: '68.6 KiB',
        format: 'PNG',
        openInNewTab: true,
        path: '/assets/social/serhat-soruklu-systems-coupyn-og.png',
      },
      {
        action: 'Download SVG source',
        dimensions: '1200 × 630',
        fileName: 'serhat-soruklu-systems-coupyn-og.svg',
        fileSize: '13.0 KiB',
        format: 'SVG',
        openInNewTab: false,
        path: '/assets/social/serhat-soruklu-systems-coupyn-og.svg',
      },
    ] satisfies readonly PressMediaFormat[],
  },
  stervoxMedia: {
    title: 'Stervox system media graphic',
    description: 'First-party Stervox artwork with the official outlined wordmark and planned launch status.',
    previewSrc: '/assets/social/serhat-soruklu-systems-stervox-og.png',
    previewAlt: 'STERVOX by Serhat Soruklu. Make the bricks. Build the future. Coming soon, planned launch 5 January 2027.',
    formats: [
      {
        action: 'Open full-resolution PNG', dimensions: '1200 × 630',
        fileName: 'serhat-soruklu-systems-stervox-og.png', fileSize: '67.1 KiB',
        format: 'PNG', openInNewTab: true, path: '/assets/social/serhat-soruklu-systems-stervox-og.png',
      },
      {
        action: 'Download SVG source', dimensions: '1200 × 630',
        fileName: 'serhat-soruklu-systems-stervox-og.svg', fileSize: '103.4 KiB',
        format: 'SVG', openInNewTab: false, path: '/assets/social/serhat-soruklu-systems-stervox-og.svg',
      },
    ] satisfies readonly PressMediaFormat[],
  },
  codarisMedia: {
    title: 'CODARIS system media graphic',
    description:
      'First-party artwork for the CODARIS developer coalition system page, available in raster and vector formats.',
    previewSrc: '/assets/social/serhat-soruklu-systems-codaris-og.png',
    previewAlt: 'CODARIS responsible systems coalition and BUILD, VERIFY, ADVANCE work cycle.',
    formats: [
      {
        action: 'Open full-resolution PNG',
        dimensions: '1200 × 630',
        fileName: 'serhat-soruklu-systems-codaris-og.png',
        fileSize: '58.9 KiB',
        format: 'PNG',
        openInNewTab: true,
        path: '/assets/social/serhat-soruklu-systems-codaris-og.png',
      },
      {
        action: 'Download SVG source',
        dimensions: '1200 × 630',
        fileName: 'serhat-soruklu-systems-codaris-og.svg',
        fileSize: '4.9 KiB',
        format: 'SVG',
        openInNewTab: false,
        path: '/assets/social/serhat-soruklu-systems-codaris-og.svg',
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
  stervox: {
    description:
      'Stervox is a pre-launch financial technology company founded by Serhat Soruklu, focused on open finance and financial infrastructure. STERVOX is the master brand, VOXFINANCE the customer-facing product, and VOXCORE the underlying financial systems architecture. Architecture and foundations are in development; cards, balances and payments are planned capabilities rather than live services.',
    technicalContext: ['C17', 'libevent', 'libpq', 'PostgreSQL', 'OpenAPI', 'JSON Schema'],
  },
  systems: [
    {
      index: '01',
      title: 'Coupyn',
      description: 'Production coupon, referral and affiliate intelligence platform.',
      path: '/systems/coupyn',
    },
    {
      index: '02', title: 'Stervox',
      description: 'Financial platform and VOXCORE foundations in development. Planned launch: 5 January 2027; roadmap through 2036.',
      path: '/systems/stervox',
    },
    {
      index: '03',
      title: 'ChatPDM',
      description:
        'A deterministic concept system for authored, versioned meaning and bounded resolution.',
      path: '/systems/chatpdm',
    },
    {
      index: '04',
      title: 'CODARIS',
      description:
        'An early-stage developer coalition and technical platform advancing practical work on responsible intelligent systems.',
      path: '/systems/codaris',
    },
    {
      index: '05',
      title: 'Deterministic Boundary Firewall',
      description:
        'A bounded pre-egress security experiment for inspecting requests before model or tool execution.',
      path: '/systems/deterministic-boundary-firewall',
    },
    {
      index: '06',
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
      sourceType: 'OFFICIAL COMPANY RECORD',
      name: 'Companies House',
      description: 'STERVOX LIMITED · Company 17514320',
      url: 'https://find-and-update.company-information.service.gov.uk/company/17514320',
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
      sourceType: 'OFFICIAL PROJECT',
      name: 'Stervox',
      description: 'Pre-launch financial technology company · Architecture and foundation development',
      url: 'https://stervox.com/',
      rel: 'noopener noreferrer',
    },
    {
      sourceType: 'OFFICIAL PROJECT',
      name: 'CODARIS',
      description: 'Independent developer coalition and technical platform',
      url: 'https://codaris.org/',
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

function lightArtwork<T extends { previewSrc: string; formats: readonly PressMediaFormat[] }>(
  media: T,
  fileSizes: Record<PressMediaFormat['format'], string>,
) {
  const lightPath = (path: string) => path.replace(/\.(png|svg)$/, '-light.$1');

  return {
    ...media,
    previewSrc: lightPath(media.previewSrc),
    formats: media.formats.map(format => ({
      ...format,
      path: lightPath(format.path),
      fileName: lightPath(format.fileName),
      fileSize: fileSizes[format.format],
    })),
  };
}

export const pressLightMedia = {
  coupynMedia: lightArtwork(pressContent.coupynMedia, { PNG: '69.5 KiB', SVG: '13.2 KiB' }),
  stervoxMedia: lightArtwork(pressContent.stervoxMedia, { PNG: '67.8 KiB', SVG: '103.1 KiB' }),
  codarisMedia: lightArtwork(pressContent.codarisMedia, { PNG: '59.3 KiB', SVG: '5.2 KiB' }),
};
