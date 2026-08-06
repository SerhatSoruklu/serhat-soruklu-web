import type { SurnameImageContent, SurnameImageDialogData } from './surname-image-dialog.types';
import type { SurnameLanguage } from './soruklu-surname-language.service';

export const evliyaDocumentAssets = {
  avif720: '/assets/soruklu-surname/evliya-celebi-seyahatname-soruk-1896-page-402-720.avif',
  avif1200: '/assets/soruklu-surname/evliya-celebi-seyahatname-soruk-1896-page-402-1200.avif',
  height: 3432,
  original: '/assets/soruklu-surname/evliya-celebi-seyahatname-soruk-1896-page-402-original.jpg',
  presentation: 'document',
  webp720: '/assets/soruklu-surname/evliya-celebi-seyahatname-soruk-1896-page-402-720.webp',
  webp1200: '/assets/soruklu-surname/evliya-celebi-seyahatname-soruk-1896-page-402-1200.webp',
  width: 2158,
} as const;

export const evliyaDocumentContent: Record<SurnameLanguage, SurnameImageContent> = {
  en: {
    action: 'View document',
    actionAriaLabel:
      'Open the Ottoman-script Seyahatname page containing Soruk in a document dialog',
    alt: 'Printed Ottoman-script page 402 of the 1896 second volume of Evliya Çelebi’s Seyahatname; the form صوروق appears near the foot of the page.',
    chips: [
      { icon: 'place-history', label: 'Evliya Çelebi' },
      { icon: 'place-image', label: 'Seyahatname · volume 2' },
      { icon: 'place-calendar', label: 'Printed page 402' },
      { icon: 'place-flag', label: 'Public domain' },
    ],
    closeAriaLabel: 'Close the Ottoman-script Seyahatname document dialog',
    context:
      'Near the foot of the page, the route runs from Göl to the village printed as صوروق and onward over the Kunduz plateau to Zeytun. This documents the standalone place-name form in the Seyahatname tradition; it does not date Soruk Bey.',
    contextLabel: 'What the page shows',
    date: '1896 edition · account dated 1648',
    dateLabel: 'Document context',
    description:
      'A public-domain Ottoman-script printing of the passage that preserves the standalone Soruk form in Evliya Çelebi’s Vezirköprü route account.',
    dialogEyebrow: 'Primary-text image',
    htmlLang: 'en-GB',
    kicker: 'Ottoman-script evidence',
    location:
      'Evliya Çelebi, Seyahatname, volume 2, İkdam Matbaası, 1896, printed page 402 · Internet Archive leaf n90',
    locationLabel: 'Edition and page',
    summary:
      'Evliya Çelebi (born 1611; probably died in 1684) was an Ottoman traveller and the author of the ten-volume Seyahatname. This is a high-resolution scan of the 1896 printed edition, not an authenticated portrait or the original seventeenth-century manuscript.',
    title: 'Soruk in the Ottoman-script Seyahatname',
  },
  tr: {
    action: 'Belgeyi görüntüle',
    actionAriaLabel:
      'Soruk adının geçtiği Osmanlı harfli Seyahatname sayfasını belge penceresinde aç',
    alt: 'Evliya Çelebi Seyahatnamesi’nin 1896 tarihli ikinci cildinin Osmanlı harfleriyle basılmış 402. sayfası; sayfanın alt bölümünde صوروق biçimi görülüyor.',
    chips: [
      { icon: 'place-history', label: 'Evliya Çelebi' },
      { icon: 'place-image', label: 'Seyahatname · 2. cilt' },
      { icon: 'place-calendar', label: 'Basılı sayfa 402' },
      { icon: 'place-flag', label: 'Kamu malı' },
    ],
    closeAriaLabel: 'Osmanlı harfli Seyahatname belge penceresini kapat',
    context:
      'Sayfanın alt bölümünde güzergâh Göl’den صوروق biçiminde basılan köye, oradan Kunduz yaylasını aşarak Zeytun’a uzanır. Bu kayıt Seyahatname geleneğindeki müstakil yer adı biçimini belgeler; Soruk Bey’in tarihini göstermez.',
    contextLabel: 'Sayfanın gösterdiği',
    date: '1896 baskısı · anlatı tarihi 1648',
    dateLabel: 'Belge bağlamı',
    description:
      'Evliya Çelebi’nin Vezirköprü güzergâhı anlatısında müstakil Soruk biçimini koruyan pasajın kamu malı Osmanlı harfli baskısı.',
    dialogEyebrow: 'Asıl metin görseli',
    htmlLang: 'tr-TR',
    kicker: 'Osmanlı harfli kanıt',
    location:
      'Evliya Çelebi, Seyahatname, 2. cilt, İkdam Matbaası, 1896, basılı sayfa 402 · Internet Archive n90 yaprağı',
    locationLabel: 'Baskı ve sayfa',
    summary:
      'Evliya Çelebi (1611 doğumlu; muhtemelen 1684’te öldü), Osmanlı seyyahı ve on ciltlik Seyahatname’nin yazarıdır. Bu görsel, 1896 baskısının yüksek çözünürlüklü taramasıdır; doğrulanmış bir portre veya 17. yüzyıldaki asıl yazma değildir.',
    title: 'Osmanlı harfli Seyahatname’de Soruk',
  },
};

export const evliyaDocumentDialogData: SurnameImageDialogData = {
  assets: evliyaDocumentAssets,
  content: evliyaDocumentContent,
};
