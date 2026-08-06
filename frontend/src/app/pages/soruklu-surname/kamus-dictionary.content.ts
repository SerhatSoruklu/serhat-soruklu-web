import type { SurnameImageContent, SurnameImageDialogData } from './surname-image-dialog.types';
import type { SurnameLanguage } from './soruklu-surname-language.service';

const kamusSourceUrl = 'https://www.osmanlicasozlukler.com/kamusiturki/tafsil-262580-cv2.html';

export const kamusDictionaryAssets = {
  height: 1024,
  original: '/assets/soruklu-surname/kamus-i-turki-soruk-entry-page-838.png',
  presentation: 'dictionary',
  width: 1536,
} as const;

export const kamusDictionaryContent: Record<SurnameLanguage, SurnameImageContent> = {
  en: {
    action: 'View dictionary entry',
    actionAriaLabel: 'Open the Kâmûs-ı Türkî dictionary entry for soruk in a dialog',
    alt: 'Ottoman-script Kâmûs-ı Türkî dictionary entry for the word soruk.',
    chips: [
      { icon: 'place-image', label: 'Kâmûs-ı Türkî' },
      { icon: 'place-calendar', label: 'Page 838 · entry 19' },
      { icon: 'place-history', label: 'soruk · صوروق' },
      { icon: 'place-flag', label: 'Origin unproven' },
    ],
    closeAriaLabel: 'Close the Kâmûs-ı Türkî dictionary-entry dialog',
    context:
      'Kâmûs-ı Türkî, page 838, records the Ottoman-script form صوروق, transliterated as soruk, with the equivalents sual and pürsiş, meaning “question” or “inquiry.” This confirms an obsolete dictionary meaning of the word. It does not establish that this meaning produced Soruk Bey’s name, the Soruk settlement, or the Soruklu surname.',
    contextLabel: 'Evidence boundary',
    date: 'Page 838 · entry 19',
    dateLabel: 'Dictionary reference',
    description:
      'An Ottoman dictionary entry records soruk with meanings related to “question” or “inquiry.”',
    dialogEyebrow: 'Dictionary evidence · origin unproven',
    htmlLang: 'en-GB',
    kicker: 'Dictionary evidence · origin unproven',
    location: 'Şemseddin Sami · Kâmûs-ı Türkî · soruk entry · page 838',
    locationLabel: 'Source and entry',
    sourceAction: 'Open the dictionary source',
    sourceActionAriaLabel: 'Open the Kâmûs-ı Türkî soruk entry on Osmanlıca Sözlükler in a new tab',
    sourceUrl: kamusSourceUrl,
    summary:
      'The supplied facsimile preserves the dictionary’s historical word entry. It documents a lexical sense, not a surname etymology.',
    title: 'Kâmûs-ı Türkî: the historical word soruk',
  },
  tr: {
    action: 'Sözlük maddesini görüntüle',
    actionAriaLabel: 'Kâmûs-ı Türkî’deki soruk maddesini sözlük penceresinde aç',
    alt: 'Kâmûs-ı Türkî’de soruk kelimesinin Osmanlı harfli sözlük maddesi.',
    chips: [
      { icon: 'place-image', label: 'Kâmûs-ı Türkî' },
      { icon: 'place-calendar', label: 'Sayfa 838 · sıra 19' },
      { icon: 'place-history', label: 'soruk · صوروق' },
      { icon: 'place-flag', label: 'Köken kanıtlanmadı' },
    ],
    closeAriaLabel: 'Kâmûs-ı Türkî sözlük maddesi penceresini kapat',
    context:
      'Kâmûs-ı Türkî’nin 838. sayfasında, Osmanlı harfleriyle صوروق biçiminde yazılan soruk kelimesi “sual” ve “pürsiş” karşılıklarıyla kaydedilmiştir. Bu kayıt, kelimenin tarihî Türkçede “soru” veya “sorgulama” çevresinde eski bir sözlük anlamının bulunduğunu gösterir. Ancak bu anlamın Soruk Bey’in adına, Soruk yer adına veya Soruklu soyadına kaynaklık ettiğini kanıtlamaz.',
    contextLabel: 'Kanıtın sınırı',
    date: 'Sayfa 838 · sıra 19',
    dateLabel: 'Sözlük kaydı',
    description:
      'Osmanlıca bir sözlük maddesi, soruk kelimesini “sual” ve “pürsiş” anlamlarıyla kaydeder.',
    dialogEyebrow: 'Sözlük kanıtı · köken kanıtlanmış değil',
    htmlLang: 'tr-TR',
    kicker: 'Sözlük kanıtı · köken kanıtlanmış değil',
    location: 'Şemseddin Sami · Kâmûs-ı Türkî · soruk maddesi · sayfa 838',
    locationLabel: 'Kaynak ve madde',
    sourceAction: 'Sözlük kaynağını aç',
    sourceActionAriaLabel: 'Osmanlıca Sözlükler’deki Kâmûs-ı Türkî soruk maddesini yeni sekmede aç',
    sourceUrl: kamusSourceUrl,
    summary:
      'Sağlanan tıpkıbasım kırpıntısı, sözlüğün tarihî kelime maddesini korur. Bir sözlük anlamını belgeler; soyadı kökenini değil.',
    title: 'Kâmûs-ı Türkî’de tarihî soruk kelimesi',
  },
};

export const kamusDictionaryDialogData: SurnameImageDialogData = {
  assets: kamusDictionaryAssets,
  content: kamusDictionaryContent,
};
