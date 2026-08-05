import type { SurnameLanguage } from './soruklu-surname-language.service';

export const saridibekPhotoAssets = {
  avif720: '/assets/soruklu-surname/vezirkopru-saridibek-koyu-720.avif',
  avif1200: '/assets/soruklu-surname/vezirkopru-saridibek-koyu-1200.avif',
  webp720: '/assets/soruklu-surname/vezirkopru-saridibek-koyu-720.webp',
  webp1200: '/assets/soruklu-surname/vezirkopru-saridibek-koyu-1200.webp',
  original: '/assets/soruklu-surname/vezirkopru-saridibek-koyu-13-november-2019.png',
} as const;

export const saridibekPhotoContent: Record<SurnameLanguage, {
  readonly action: string;
  readonly actionAriaLabel: string;
  readonly alt: string;
  readonly chips: readonly { readonly icon: string; readonly label: string }[];
  readonly closeAriaLabel: string;
  readonly context: string;
  readonly contextLabel: string;
  readonly date: string;
  readonly dateLabel: string;
  readonly description: string;
  readonly dialogEyebrow: string;
  readonly htmlLang: string;
  readonly kicker: string;
  readonly location: string;
  readonly locationLabel: string;
  readonly summary: string;
  readonly title: string;
}> = {
  en: {
    action: 'View photograph',
    actionAriaLabel: 'Open the Vezirkopru Saridibek Koyu photograph in a dialog',
    alt: 'Green fields and forested mountains around Sarıdibek village near Vezirköprü, Türkiye.',
    chips: [
      { icon: 'place-flag', label: 'Türkiye' },
      { icon: 'place-map', label: 'Samsun' },
      { icon: 'place-pin', label: 'Vezirköprü' },
      { icon: 'place-history', label: 'Sarıdibek / Soruk' },
    ],
    closeAriaLabel: 'Close the Sarıdibek photograph dialog',
    context: 'The settlement identified in the research as the village formerly called Soruk.',
    contextLabel: 'Historical context',
    date: '13 November 2019',
    dateLabel: 'Record date',
    description:
      'A landscape record from Sarıdibek, the Vezirköprü settlement identified in the research as the village formerly called Soruk.',
    dialogEyebrow: 'Place record',
    htmlLang: 'en-GB',
    kicker: 'Sarıdibek in view',
    location: 'Sarıdibek · Vezirköprü · Samsun · Türkiye',
    locationLabel: 'Location',
    summary:
      'This photograph adds a contemporary visual record to the documentary trail. It illustrates the place discussed on this page; it does not establish a family or migration link by itself.',
    title: 'Vezirkopru Saridibek Koyu',
  },
  tr: {
    action: 'Fotoğrafı görüntüle',
    actionAriaLabel: 'Vezirköprü Sarıdibek Köyü fotoğrafını fotoğraf penceresinde aç',
    alt: 'Vezirköprü yakınındaki Sarıdibek köyünün yeşil tarlaları ve ormanlık dağları.',
    chips: [
      { icon: 'place-flag', label: 'Türkiye' },
      { icon: 'place-map', label: 'Samsun' },
      { icon: 'place-pin', label: 'Vezirköprü' },
      { icon: 'place-history', label: 'Sarıdibek / Soruk' },
    ],
    closeAriaLabel: 'Sarıdibek fotoğraf penceresini kapat',
    context: 'Araştırmada eski adı Soruk olarak belirtilen yerleşim.',
    contextLabel: 'Tarihî bağlam',
    date: '13 Kasım 2019',
    dateLabel: 'Kayıt tarihi',
    description:
      'Araştırmada eski adı Soruk olarak belirtilen Vezirköprü yerleşimi Sarıdibek’ten bir manzara kaydı.',
    dialogEyebrow: 'Yer kaydı',
    htmlLang: 'tr-TR',
    kicker: 'Sarıdibek’ten görünüm',
    location: 'Sarıdibek · Vezirköprü · Samsun · Türkiye',
    locationLabel: 'Konum',
    summary:
      'Bu fotoğraf, belgesel zaman çizgisine güncel bir görsel kayıt ekler. Sayfada anlatılan yeri gösterir; tek başına aile veya göç bağlantısı kurmaz.',
    title: 'Vezirköprü Sarıdibek Köyü',
  },
};
