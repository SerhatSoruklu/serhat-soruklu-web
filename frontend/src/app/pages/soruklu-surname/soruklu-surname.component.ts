import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  mdiAccountGroupOutline,
  mdiBookOpenPageVariantOutline,
  mdiCursorDefaultClickOutline,
  mdiFileDocumentOutline,
  mdiHomeGroup,
  mdiImageSearchOutline,
  mdiMapClockOutline,
  mdiMapMarkerOutline,
  mdiMapMarkerPath,
  mdiNewspaperVariantOutline,
  mdiSchoolOutline,
} from '@mdi/js';

import { pageSeoMetadata } from '../../core/seo/seo.config';
import { SeoService } from '../../core/seo/seo.service';
import { PathIconComponent } from '../../shared/icons/path-icon.component';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';
import { SaridibekDialogService } from './saridibek-dialog/saridibek-dialog.service';
import { saridibekPhotoAssets, saridibekPhotoContent } from './saridibek-photo.content';
import { SorukluSurnameLanguageService } from './soruklu-surname-language.service';
import type { SurnameLanguage } from './soruklu-surname-language.service';

const languageStorageKey = 'serhatsoruklu-surname-language';
const sourceUrls = {
  suffix:
    'https://tdk.gov.tr/wp-content/uploads/2011/12/Terim-Sorunlari-ve-Terim-Yapma-Yollari-_2025_-WEB.pdf',
  registers: 'https://www.belleten.gov.tr/eng/full-text-pdf/2265/tur',
  evliya: 'https://dergipark.org.tr/en/download/article-file/1849989',
  sorukBey: 'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page200.html',
  sorukluHafizAli: 'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page170.html',
  oralTradition:
    'https://arastirma.tarimorman.gov.tr/tepge/Belgeler/Yay%C4%B1n%20Ar%C5%9Fivi/2012-2016%20Yay%C4%B1n%20Ar%C5%9Fivi/Yay%C4%B1nNo270.pdf',
  boundaryArchive:
    'https://www.corum.bel.tr/public/uploads/2023/05/orum-belgeleri-cumhuriyet-arsivleri.pdf',
  currentOsmancik:
    'https://www.corumozelidare.gov.tr/kurumlar/corumozelidare.gov.tr/GENEL-HABERLER/2025/CORUM-IL-OZEL-IDARESI-2024-YILI-FAALIYET-RAPORU.pdf',
  earlyRepublic:
    'https://cdn.tbmm.gov.tr/TbmmWeb/Yayinlar/Dosya/f8a3911b-cad6-4515-b920-a283a2654f9e.pdf',
  localReport:
    'https://www.vezirkopruvatandas.com.tr/saridibek-koyunde-3000-donum-arazi-col-haline-geldi.html',
  sorukValley: 'https://www.vezirkoprutso.org.tr/vezirkopru/genel-bakis/',
  tekmenPublic: 'https://www.corumhaber.net/sukru-soruklu-hayatini-kaybetti',
  bafraPublic:
    'https://www.bafra.bel.tr/Uploads/Resimler/Sayfalar/2025/5/-2024-Yili-Faaliyet-Roporu-/Orj-30756829c6cbfdcac12668ad5291.pdf',
  servetKoroglu:
    'https://www.osmancik.gov.tr/arastirmaci-yazar-salim-savci-ve-tekmen-koyu-muhtari-servet-koroglu-sayin-kaymakamimizi-ziyaret-etti',
} as const;

const surnameContent = {
  en: {
    htmlLang: 'en-GB',
    seo: pageSeoMetadata.sorukluSurname,
    switchLabel: 'Türkçe oku',
    switchAriaLabel: 'Türkçe oku — read this page in Turkish',
    eyebrow: 'A name rooted in place',
    title: 'What does Soruklu mean?',
    lead: 'Soruklu is a distinctive Turkish surname with a clear linguistic structure, rooted in a regional place name documented from the Ottoman period.',
    introduction:
      'The strongest supportable interpretation is place-based: a person or family associated with, belonging to, or originating from Soruk. Direct modern descent requires family-specific records.',
    formationLabel: 'The formation',
    formationAriaLabel: 'Soruk plus lu forms Soruklu',
    formationMeaning: 'Association, belonging, or origin',
    photo: saridibekPhotoContent.en,
    meaning: {
      kicker: 'Direct meaning',
      heading: 'A place name, followed by a marker of connection.',
      paragraphs: [
        'Soruk is the root. The suffix -lu belongs to the Turkish suffix family -lı / -li / -lu / -lü, which forms words expressing possession, association, or connection. The Turkish Language Association gives place-based examples such as Bağdatlı, Mısırlı, and Vanlı.',
        'Read in that established pattern, Soruklu most naturally means someone connected with Soruk. It is a disciplined linguistic interpretation, not by itself a family tree.',
      ],
      noteLabel: 'Strongest supportable reading',
      note: 'Someone or a family associated with, belonging to, or originating from Soruk.',
    },
    quickSummary: {
      heading: 'What we know in 30 seconds',
      items: [
        'Soruklu most naturally means connected with Soruk.',
        'Soruk is documented as a regional place name from the sixteenth century.',
        'Soruklu appears as an Ottoman-period personal identifier.',
        'Soruk Bey is a plausible historical explanation for the place name.',
        'Direct modern descent remains unproven.',
      ],
    },
    timeline: {
      kicker: 'Documentary timeline',
      heading:
        'The Soruk place name and the Soruklu identifier appear in records across centuries.',
      introduction:
        'Most entries trace the place name; one documents Soruklu as a pre-1934 personal identifier. Together they are not a continuous family record.',
      yearLabel: 'Year',
      entries: [
        {
          date: 'c. 1520',
          label: 'Ottoman register study',
          title: 'Sorukderesi appears as a mezraa.',
          description:
            'A study of register TT 387 lists Sorukderesi in the Göl district with six nefer, a unit for taxable males rather than total population. Its blank 1485 column means only that the study found no entry under that name in that register.',
        },
        {
          date: '1576',
          label: 'Ottoman register study',
          title: 'Sorukderesi is recorded as a village.',
          description:
            'The same study lists Sorukderesi as a karye, or village, with 55 nefer, firmly documenting the place name in the sixteenth century.',
        },
        {
          date: '1648',
          label: 'Ottoman travel text',
          title: 'Soruk appears in the Seyahatname tradition.',
          description:
            'A study of Evliya Çelebi’s Vezirköprü account reproduces Súrúk in the Zeytun district, while warning that the western route was probably not travelled first-hand.',
        },
        {
          date: '1786–87',
          label: 'Ottoman-period identifier',
          title: '“Soruklu Hâfız Ali Efendi” is named in Amasya Tarihi.',
          description:
            'Amasya Tarihi records Soruklu Hâfız Ali Efendi as a Dârü’l-Hadîs müderris in Hijri 1201, restored in 1208 and succeeded by his son after his death in 1221. This is pre-1934 personal usage, not a modern statutory surname.',
        },
        {
          date: '1920',
          label: 'Early Republican record',
          title: 'Residents are identified as being from Soruk village.',
          description:
            'Published Amasya Independence Tribunal records identify Soruk villagers by household names including İsmailoğulları and Değirmencioğulları, mapping village society before the Surname Law without showing Soruklu as their surname.',
        },
        {
          date: '1959',
          label: 'Republic archive catalogue',
          title: 'Soruk and Osmancık’s Gökdere are documented across one boundary.',
          description:
            'A Çorum Municipality archive catalogue lists telegrams, petitions, a decision and a sketch for the boundary dispute between Vezirköprü’s Soruk village and Osmancık’s Gökdere village.',
        },
        {
          date: '1974',
          label: 'Local reporting',
          title: 'Sarıdibek is identified by its former name, Soruk.',
          description:
            'A reproduced Vezirköprü newspaper report calls Sarıdibek by its former name, Soruk, and says that some residents moved towards Osmancık and larger cities.',
        },
        {
          date: 'Present',
          label: 'Current administrative records',
          title: 'Soruk remains visible in two distinct local contexts.',
          description:
            'Sarıdibek and Tahtaköprü remain associated with the Soruk Valley around Vezirköprü, while a current official report separately lists Yenidanişment/Soruk in Osmancık.',
        },
      ],
    },
    records: {
      kicker: 'Evidence audit',
      heading: 'What can—and cannot—be concluded.',
      introduction:
        'Every major claim from the research is retained here, but its status depends on what the underlying source can actually establish.',
      items: [
        {
          index: '01',
          label: 'High confidence · why yes',
          title: 'Soruklu most naturally means “connected with Soruk”.',
          description:
            'The Turkish -lu suffix expresses association, belonging or place-based origin; Soruk is independently documented as a place name.',
        },
        {
          index: '02',
          label: 'High confidence · why yes',
          title: 'The Soruk place name is securely Ottoman-period.',
          description:
            'Register research records Sorukderesi around 1520 and in 1576; the seventeenth-century Seyahatname tradition preserves Soruk.',
        },
        {
          index: '03',
          label: 'Supported · with a limit',
          title: 'Soruklu was used as a personal identifier before 1934.',
          description:
            'Amasya Tarihi records Soruklu Hâfız Ali Efendi in Hijri 1201, supporting an Ottoman nisba or origin-identifier rather than an inherited legal surname.',
        },
        {
          index: '04',
          label: 'Later tradition · plausible',
          title: 'Soruk Bey may explain the settlement name.',
          description:
            'Amasya Tarihi links Soruk villages to Soruk Bey of Karalı within Kanık, but the account is later than the events described.',
        },
        {
          index: '05',
          label: 'Local tradition · why not proven',
          title: 'The “1200s, Kınık Yörük bey” detail remains tradition.',
          description:
            'A ministry report labels the 1200s and Kınık Yörük-bey details as rivayet; Amasya Tarihi prints Kanık, and no contemporary medieval source resolves either point.',
        },
        {
          index: '06',
          label: 'Research lead · not verified',
          title: 'The claimed “Sorukluzâde Râşid Ahmed Efendi” bridge is not used as evidence.',
          description:
            'The supplied research names him, but the phrase was not found in the searchable official Amasya Municipality volumes. A precise edition, page or scan is needed.',
        },
        {
          index: '07',
          label: 'Withdrawn · why not',
          title: '“Question” or “inquiry” is not presented as the surname’s origin.',
          description:
            'Older forms resembling soruk do not explain the names of Soruk Bey, the settlement or the surname; the place-based reading has stronger evidence.',
        },
        {
          index: '08',
          label: 'Unproven · records required',
          title: 'Direct descent and the 1934 surname decision remain open.',
          description:
            'Continuous descent requires family population and civil registers plus the earliest formal surname record; geography and repeated names cannot replace them.',
        },
      ],
    },
    account: {
      kicker: 'Soruk Bey and the name',
      heading: 'A historical explanation survives—but its date does not.',
      paragraphs: [
        'Amasya Tarihi places Esenli and Karalı groups of Kanık in Zeytun, names Soruk Bey among Karalı and says Soruk villages preserved his name.',
        'A modern ministry report gives a more specific local tradition: Soruk was named after Soruk Bey, said to have settled there in the 1200s and to have been a Kınık Yörük bey within Karalı. Both details are marked rivayet, not contemporary evidence.',
        'The sources do not resolve Kanık/Kınık or give Soruk Bey secure life dates, family, grave or office.',
      ],
      wordLabel: 'What this can support',
      wordNote:
        'This later historical explanation supports a plausible origin for the place name, not a contemporary attestation.',
    },
    geography: {
      kicker: 'Places and family context',
      heading: 'Two Soruk locations; one regional research corridor.',
      introduction:
        'The evidence keeps the two localities distinct while defining a focused regional research corridor.',
      placeHeading: 'Place or context',
      evidenceHeading: 'What is documented',
      readingHeading: 'Responsible reading',
      rows: [
        {
          place: 'Vezirköprü · Soruk / Sorukderesi / Sarıdibek',
          evidence:
            'Tahrir entries, Seyahatname, the 1959 boundary file, the 1974 report and the continuing name “Soruk Valley”.',
          reading:
            'Strong continuity for a historical place name. This is the best-documented Soruk location in the research.',
        },
        {
          place: 'Osmancık · Yenidanişment / Soruk',
          evidence:
            'A current Çorum İl Özel İdaresi report separately lists “OSMANCIK Yenidanişment/Soruk”.',
          reading: 'A distinct present-day Soruk locality in Osmancık.',
        },
        {
          place: 'Osmancık · Tekmen, Karataş and Saltık/Saltuk',
          evidence:
            'Serhat Soruklu identifies these places as paternal family context; public references also associate Soruklu with Tekmen and Karataş.',
          reading:
            'A high-priority location for family-specific registry, cemetery and land research.',
        },
        {
          place: 'Osmancık–Vezirköprü–Bafra corridor',
          evidence:
            'The 1959 file places Soruk on the Osmancık boundary; local reporting notes movement towards Osmancık and public records show Soruklu across the wider corridor.',
          reading:
            'A plausible regional footprint; no reliable surname distribution has yet been measured.',
        },
      ],
      noteLabel: 'First-hand family context',
      note: 'Tekmen, Karataş and Saltık/Saltuk are known paternal context. Research should start with the earliest named paternal ancestor and registered locality, then work backwards through civil and Ottoman population records.',
    },
    population: {
      kicker: 'Local family knowledge',
      heading: 'The living footprint of a rare surname',
      introduction:
        'The available figures are local estimates rather than an official surname census. They describe both the changing size of Tekmen village and the wider Soruk and Soruklu surname network shaped by migration.',
      measureHeading: 'Measure',
      accountHeading: 'Local account',
      boundaryHeading: 'Evidence boundary',
      rows: [
        {
          measure: 'Present-day surname estimate',
          account:
            'Local family knowledge suggests that approximately 500 living people may carry the Soruklu surname today.',
          boundary: 'An approximate local estimate, not an official national count.',
        },
        {
          measure: 'Present-day village households',
          account:
            'Tekmen is estimated to contain approximately 150 households today, although not every household carries the Soruk or Soruklu surname.',
          boundary: 'A village household estimate, not a count of Soruklu families.',
        },
        {
          measure: 'Village size in the 1950s',
          account:
            'Tekmen was remembered as having approximately 500 households during the 1950s, but the surname distribution within those households is unknown.',
          boundary:
            'A remembered household count; it does not identify the surnames used in each home.',
        },
        {
          measure: 'Known Osmancık families outside Tekmen',
          account:
            'Servet Köroğlu stated that he personally knows at least 10 families in Osmancık carrying the Soruk or Soruklu surname, excluding those living in Tekmen.',
          boundary: 'His local knowledge, not an independently verified family count.',
        },
        {
          measure: 'Migration pattern',
          account:
            'According to Servet Köroğlu’s local account, Soruk and Soruklu were commonly adopted or retained among families who migrated to other places.',
          boundary:
            'This does not establish that every migrant adopted either surname or that all families share one lineage.',
        },
        {
          measure: 'Yenidanişment and the Soruk neighbourhood',
          account:
            'According to Servet Köroğlu’s local account, Yenidanişment village was founded by families who came from Soruk, and the Soruk name continues today in a neighbourhood attached to the village.',
          boundary:
            'The current official record confirms the name Yenidanişment/Soruk, but the claimed founding and migration connection has not yet been independently verified through archival records.',
        },
      ],
      evidenceLabel: 'Local testimony · approximate and not independently counted',
      attribution:
        'These local estimates were provided by Servet Köroğlu, who served as muhtar of Tekmen village in Osmancık. An official Osmancık District Governorate record dated 31 March 2017 identifies him as Tekmen Village muhtar. The population and surname figures remain local estimates and have not yet been verified against a complete official surname or population register.',
      workingEstimateLabel: 'Working estimate · low confidence',
      workingEstimate:
        'A very rough demographic extrapolation suggests that the total number of people who have carried the Soruklu surname since 1934 may be in the low thousands. No complete official count has yet been identified.',
    },
    unknown: {
      kicker: 'What remains unproven',
      heading: 'The evidence has a clear boundary.',
      introduction:
        'These questions require family-specific civil and archival records, not inference.',
      items: [
        'Direct descent from Soruk Bey for any modern Soruklu family.',
        'A precise medieval date for Soruk Bey or the settlement.',
        'Whether Kanık and Kınık in the two accounts are simply variant transmissions in this case.',
        'Whether the unlocated Sorukluzâde research lead is accurate.',
        'When and how a particular family adopted Soruklu as a formal surname.',
        'A genealogical route between Vezirköprü’s Soruk, Osmancık’s Soruk, Tekmen or Bafra.',
        'Any claim of heraldry, nobility, dynasty, or inherited authority.',
      ],
      boundary:
        'The surname has a supportable meaning and documented regional history without turning possibility into pedigree.',
    },
    sources: {
      kicker: 'Source notes',
      heading: 'The evidence behind the explanation.',
      introduction:
        'The links below lead to the strongest accessible sources used for this page. External documents open in a new tab.',
      actionLabel: 'Open source',
      actionAriaSuffix: 'opens in a new tab',
      titleTooltip: 'Opens external source in a new tab',
      items: [
        {
          number: '01',
          title: 'Terim Sorunları ve Terim Yapma Yolları',
          authority: 'Turkish Language Association · Hamza Zülfikar · 2025 edition',
          description: 'Explains -lı / -li / -lu / -lü and gives place-association examples.',
          url: sourceUrls.suffix,
        },
        {
          number: '02',
          title: 'Tahrir Defterlerine Göre Vezirköprü Yöresinde İskân ve Nüfus (1485–1576)',
          authority: 'Belleten · Mehmet Öz',
          description: 'Publishes the table listing Sorukderesi around 1520 and in 1576.',
          url: sourceUrls.registers,
        },
        {
          number: '03',
          title: 'Evliya Çelebi in Vezirköprü, 1648',
          authority: 'Cedrus IX · Tønnes Bekker-Nielsen · 2021',
          description: 'Reproduces Súrúk and critiques the route’s first-hand reliability.',
          url: sourceUrls.evliya,
        },
        {
          number: '04',
          title: 'Amasya Tarihi, volumes 1–4, page 170',
          authority: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddîn Yasar',
          description: 'Records Soruklu Hâfız Ali Efendi’s appointment, return and death.',
          url: sourceUrls.sorukluHafizAli,
        },
        {
          number: '05',
          title: 'Amasya Tarihi, volumes 1–4, page 200',
          authority: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddîn Yasar',
          description: 'Links Soruk villages with Soruk Bey, Karalı and Kanık.',
          url: sourceUrls.sorukBey,
        },
        {
          number: '06',
          title: 'Kırsal Kalkınma Amaçlı Hibe Projelerinin Değerlendirilmesi: TR83 Bölgesi Örneği',
          authority: 'Ministry of Agriculture research publication · TEPGE · publication 270',
          description: 'Labels the 1200s, Kınık and Yörük-bey details as local tradition.',
          url: sourceUrls.oralTradition,
        },
        {
          number: '07',
          title: 'Amasya İstiklal Mahkemesi, volume 12/1',
          authority: 'Grand National Assembly of Türkiye · published court records',
          description: 'Names Soruk villagers by household identifiers before the Surname Law.',
          url: sourceUrls.earlyRepublic,
        },
        {
          number: '08',
          title: 'Cumhuriyet Arşivi Çorum Belgeleri Kataloğu',
          authority: 'Çorum Municipality cultural publication · 2017 · pages 195–196',
          description:
            'Catalogues the 1959 boundary records for Vezirköprü Soruk and Osmancık Gökdere.',
          url: sourceUrls.boundaryArchive,
        },
        {
          number: '09',
          title: 'Sarıdibek Köyünde 3000 Dönüm Arazi Çöl Haline Geldi',
          authority: 'Vezirköprü Vatandaş · 1974 report reproduced in 2024',
          description:
            'Identifies Sarıdibek as former Soruk and reports movement towards Osmancık.',
          url: sourceUrls.localReport,
        },
        {
          number: '10',
          title: 'Çorum İl Özel İdaresi 2024 Yılı Faaliyet Raporu',
          authority: 'Official public-administration report',
          description: 'Separately lists Yenidanişment/Soruk in Osmancık.',
          url: sourceUrls.currentOsmancik,
        },
        {
          number: '11',
          title: 'Vezirköprü: Genel Bakış',
          authority: 'Vezirköprü Chamber of Commerce and Industry',
          description: 'Places Sarıdibek and Tahtaköprü in Soruk Valley.',
          url: sourceUrls.sorukValley,
        },
        {
          number: '12',
          title: 'Tekmen and Karataş public-record example',
          authority: 'Çorum Haber · local public notice · 2023',
          description: 'Documents one public association of Soruklu with Tekmen and Karataş.',
          url: sourceUrls.tekmenPublic,
        },
        {
          number: '13',
          title: 'Bafra Municipality 2024 Activity Report',
          authority: 'Bafra Municipality · official public report',
          description: 'Documents one official public occurrence of the Soruklu surname in Bafra.',
          url: sourceUrls.bafraPublic,
        },
        {
          number: '14',
          title:
            'Researcher and writer Salim Savcı and Tekmen Village muhtar Servet Köroğlu visited the District Governor',
          authority: 'Osmancık District Governorate · 31 March 2017',
          description:
            'Officially identifies Servet Köroğlu as the muhtar of Tekmen village in Osmancık in March 2017, supporting the attribution of the local testimony.',
          url: sourceUrls.servetKoroglu,
        },
      ],
    },
    relationship: {
      kicker: 'A separate subject',
      heading: 'The surname and the Soruklu Order are separate subjects.',
      description:
        'The Soruklu Order is a small, voluntary family-stewardship initiative established in 2025. It does not speak for, define, or represent everyone who shares the Soruklu surname.',
      action: 'Read about the Soruklu Order',
      actionAriaLabel:
        'Read about the Soruklu Order — a separate voluntary initiative established in 2025',
    },
    closing: {
      kicker: 'Meaning, carried carefully',
      heading: 'A name can be distinctive without exceeding the evidence.',
      description:
        'Soruklu carries a clear Turkish structure, an Ottoman-period place-name trail and a documented pre-1934 personal use. Its family-specific line remains open to records still to be found.',
      homeAction: 'Return to Serhat Soruklu',
      orderAction: 'Explore the Soruklu Order',
      orderAriaLabel: 'Explore the Soruklu Order — a separate voluntary initiative',
    },
  },
  tr: {
    htmlLang: 'tr-TR',
    seo: {
      ...pageSeoMetadata.sorukluSurname,
      title: 'Soruklu Soyadı: Anlamı ve Kökeni | Serhat Soruklu',
      description:
        'Soruklu soyadının Soruk + -lu yapısını, Osmanlı dönemi kayıtlarını, bölgesel izini ve soy iddialarına ilişkin kanıt sınırlarını inceleyin.',
    },
    switchLabel: 'Read in English',
    switchAriaLabel: 'Read in English — read this page in English',
    eyebrow: 'Kökü bir yere dayanan ad',
    title: 'Soruklu ne anlama geliyor?',
    lead: 'Soruklu, dilbilimsel yapısı açık olan ve kökü Osmanlı döneminden itibaren belgelenmiş bölgesel bir yer adına dayanan ayırt edici bir Türk soyadıdır.',
    introduction:
      'Kanıtların desteklediği en güçlü yorum yer bağlantılıdır: Soruk’la ilişkili, Soruk’a mensup veya Soruk kökenli kişi ya da aile. Doğrudan soy bağı aile kayıtları gerektirir.',
    formationLabel: 'Adın yapısı',
    formationAriaLabel: 'Soruk ve lu eki Soruklu adını oluşturur',
    formationMeaning: 'Bağlantı, mensubiyet veya köken',
    photo: saridibekPhotoContent.tr,
    meaning: {
      kicker: 'Doğrudan anlam',
      heading: 'Bir yer adı ve ardından bağlantı bildiren bir ek.',
      paragraphs: [
        'Soruk köktür. Türkçedeki işlek -lu eki, ilişki veya bağlantı bildiren -lı / -li / -lu / -lü ailesindendir. Türk Dil Kurumu Bağdatlı, Mısırlı ve Vanlı gibi yer bağlantılı örnekler verir.',
        'Bu yapıda Soruklu en doğal biçimde Soruk’la bağlantılı kişi demektir.',
      ],
      noteLabel: 'Kanıtlarla en güçlü biçimde desteklenen okuma',
      note: 'Soruk’la bağlantılı, Soruk’a mensup veya Soruk kökenli kişi ya da aile.',
    },
    quickSummary: {
      heading: '30 saniyede bildiklerimiz',
      items: [
        'Soruklu en doğal biçimde Soruk’la bağlantılı anlamına gelir.',
        'Soruk, 16. yüzyıldan itibaren belgelenmiş bölgesel bir yer adıdır.',
        'Soruklu, Osmanlı döneminde kişi tanımı olarak kullanılmıştır.',
        'Soruk Bey, yer adının kökenine ilişkin makul bir tarihî açıklamadır.',
        'Günümüzdeki ailelerle doğrudan soy bağı henüz kanıtlanmamıştır.',
      ],
    },
    timeline: {
      kicker: 'Belgesel zaman çizgisi',
      heading: 'Soruk yer adı ve Soruklu kişi tanımı, yüzyıllara yayılan kayıtlarda görülür.',
      introduction:
        'Kayıtların çoğu yer adını, biri Soruklu’nun 1934 öncesi kişi kullanımını belgeler; bunlar kesintisiz aile kaydı değildir.',
      yearLabel: 'Sene',
      entries: [
        {
          date: 'Yaklaşık 1520',
          label: 'Osmanlı tahrir araştırması',
          title: 'Sorukderesi bir mezraa olarak geçiyor.',
          description:
            'TT 387 üzerine bir çalışma, Göl nahiyesindeki Sorukderesi’ni altı neferle kaydeder; nefer toplam nüfus değil, vergiye tabi erkekler için kullanılan kayıt birimidir. Boş 1485 sütunu yalnızca o defterde bu adla kayıt bulunmadığını gösterir.',
        },
        {
          date: '1576',
          label: 'Osmanlı tahrir araştırması',
          title: 'Sorukderesi bir köy olarak kaydediliyor.',
          description:
            'Aynı çalışma Sorukderesi’ni 55 neferli bir karye, yani köy olarak göstererek yer adını 16. yüzyılda belgeler.',
        },
        {
          date: '1648',
          label: 'Osmanlı seyahat metni',
          title: 'Soruk, Seyahatname geleneğinde geçiyor.',
          description:
            'Evliya Çelebi’nin Vezirköprü anlatısını inceleyen bir çalışma, Zeytun kazasında Súrúk adını aktarır ve batı güzergâhının muhtemelen bizzat gezilmediğini belirtir.',
        },
        {
          date: '1786–87',
          label: 'Osmanlı dönemi kişi tanımı',
          title: 'Amasya Tarihi’nde “Soruklu Hâfız Ali Efendi” adı geçiyor.',
          description:
            'Amasya Tarihi, Soruklu Hâfız Ali Efendi’yi Hicrî 1201’de Dârü’l-Hadîs müderrisi olarak kaydeder; 1208’de göreve döndüğünü ve 1221’deki ölümünden sonra oğlunun geçtiğini bildirir. Bu, modern resmî soyadı değil, 1934 öncesi kişi kullanımıdır.',
        },
        {
          date: '1920',
          label: 'Erken Cumhuriyet kaydı',
          title: 'Soruk köyü sakinleri sülale adlarıyla kaydediliyor.',
          description:
            'Yayımlanmış Amasya İstiklal Mahkemesi kayıtları, Soruk köylülerini İsmailoğulları ve Değirmencioğulları gibi hane/sülale adlarıyla tanımlar; Soruklu soyadını kullandıklarını göstermez.',
        },
        {
          date: '1959',
          label: 'Cumhuriyet arşiv kataloğu',
          title: 'Soruk ile Osmancık’ın Gökdere köyü aynı sınırda belgeleniyor.',
          description:
            'Çorum Belediyesi arşiv kataloğu, Vezirköprü Soruk ile Osmancık Gökdere arasındaki sınır ihtilafına ait telgraf, dilekçe, karar ve krokiyi listeler.',
        },
        {
          date: '1974',
          label: 'Yerel haber',
          title: 'Sarıdibek, eski adı Soruk olarak tanımlanıyor.',
          description:
            'Yeniden yayımlanan bir Vezirköprü gazete haberi, Sarıdibek’i eski adı Soruk ile anıyor ve bazı sakinlerin Osmancık’a ve büyük şehirlere göç ettiğini aktarıyor.',
        },
        {
          date: 'Günümüz',
          label: 'Güncel idari kayıtlar',
          title: 'Soruk, iki ayrı yer bağlamında yaşamaya devam ediyor.',
          description:
            'Sarıdibek ve Tahtaköprü, Vezirköprü çevresindeki Soruk Vadisi ile anılmayı sürdürürken güncel resmî bir rapor Osmancık’ta ayrıca Yenidanişment/Soruk kaydını verir.',
        },
      ],
    },
    records: {
      kicker: 'Kanıt değerlendirmesi',
      heading: 'Neye varılabilir, neye varılamaz?',
      introduction: 'Her iddianın durumu, dayandığı kaynağın gösterebildiğiyle sınırlıdır.',
      items: [
        {
          index: '01',
          label: 'Yüksek güven · neden evet',
          title: 'Soruklu en doğal biçimde “Soruk’la bağlantılı” demektir.',
          description:
            'Türkçedeki -lu eki ilişki, mensubiyet veya yer kökeni bildirir; Soruk bağımsız olarak belgelenmiş bir yer adıdır.',
        },
        {
          index: '02',
          label: 'Yüksek güven · neden evet',
          title: 'Soruk yer adı güvenle Osmanlı dönemine uzanır.',
          description:
            'Tahrir araştırması Sorukderesi’ni yaklaşık 1520’de ve 1576’da kaydeder; 17. yüzyıl Seyahatname geleneği de Soruk adını korur.',
        },
        {
          index: '03',
          label: 'Destekli · sınırıyla birlikte',
          title: 'Soruklu, 1934’ten önce kişi tanımı olarak kullanılmıştır.',
          description:
            'Amasya Tarihi, Hicrî 1201’de Soruklu Hâfız Ali Efendi’yi kaydederek Osmanlı döneminde nisbe veya köken bildiren bir tanımı destekler; miras kalan resmî soyadı göstermez.',
        },
        {
          index: '04',
          label: 'Sonraki anlatı · makul',
          title: 'Yerleşim adını Soruk Bey açıklıyor olabilir.',
          description:
            'Amasya Tarihi, Soruk köylerini Kanık içindeki Karalı oymağından Soruk Bey ile ilişkilendirir; ancak anlatı olaylarla çağdaş değildir.',
        },
        {
          index: '05',
          label: 'Yerel rivayet · neden kanıt değil',
          title: '“1200’ler, Kınık Yörük beyi” ayrıntısı rivayet düzeyindedir.',
          description:
            'Bir bakanlık raporu 1200’ler ve Kınık Yörük beyi ayrıntılarını rivayet olarak verir; Amasya Tarihi Kanık yazar ve çağdaş bir Orta Çağ kaynağı iki noktayı da çözmez.',
        },
        {
          index: '06',
          label: 'Araştırma ipucu · doğrulanmadı',
          title: '“Sorukluzâde Râşid Ahmed Efendi” bağlantısı kanıt zincirine alınmadı.',
          description:
            'Verilen araştırma bu kişiyi adlandırıyor; ancak ifade Amasya Belediyesinin aranabilir resmî ciltlerinde bulunamadı. Kesin baskı, sayfa veya tarama gereklidir.',
        },
        {
          index: '07',
          label: 'Geri çekildi · neden değil',
          title: '“Soru” veya “sorgu” soyadının kökeni olarak sunulmuyor.',
          description:
            'Soruk’a benzeyen eski biçimler Soruk Bey’in, yerleşimin veya soyadının adını açıklamaz; yer bağlantılı okuma daha güçlü kanıta sahiptir.',
        },
        {
          index: '08',
          label: 'Kanıtlanmadı · kayıt gerekli',
          title: 'Doğrudan soy ve 1934’teki soyadı kararı açıkta duruyor.',
          description:
            'Kesintisiz soy için aile nüfus ve medeni kayıtlarıyla en eski resmî soyadı belgesi gerekir; coğrafya ve tekrar eden adlar bunların yerini tutmaz.',
        },
      ],
    },
    account: {
      kicker: 'Soruk Bey ve adın kökeni',
      heading: 'Tarihî bir açıklama var; fakat kesin tarihi yok.',
      paragraphs: [
        'Amasya Tarihi, Zeytun’da Kanık’a bağlı Esenli ve Karalı oymaklarını, Karalı içinde Soruk Bey’i ve adını koruyan Soruk köylerini kaydeder.',
        'Bir bakanlık raporu yerel rivayeti ayrıntılandırır: Soruk’un, 1200’lerde yerleştiği ve Karalı içindeki Kınık Yörük beyi olduğu söylenen Soruk Bey’den ad aldığı belirtilir. İki ayrıntı da çağdaş kanıt değildir.',
        'Kaynaklar Kanık/Kınık farkını çözmez; Soruk Bey’in güvenli tarihlerini, ailesini, mezarını veya görevini vermez.',
      ],
      wordLabel: 'Bu anlatının destekleyebildiği',
      wordNote:
        'Bu sonraki dönem anlatısı, yer adının kökeni için makul bir açıklamayı destekler; çağdaş bir tanıklık değildir.',
    },
    geography: {
      kicker: 'Yerler ve aile bağlamı',
      heading: 'İki Soruk yeri; tek bir bölgesel araştırma hattı.',
      introduction:
        'Kanıtlar iki yerleşimi ayrı tutarken odaklı bir bölgesel araştırma hattı ortaya koyar.',
      placeHeading: 'Yer veya bağlam',
      evidenceHeading: 'Belgelenen',
      readingHeading: 'Kanıtın izin verdiği yorum',
      rows: [
        {
          place: 'Vezirköprü · Soruk / Sorukderesi / Sarıdibek',
          evidence:
            'Tahrir kayıtları, Seyahatname, 1959 sınır dosyası, 1974 haberi ve “Soruk Vadisi” adının süren kullanımı.',
          reading:
            'Tarihî bir yer adı için güçlü süreklilik. Araştırmadaki en iyi belgelenmiş Soruk yeridir.',
        },
        {
          place: 'Osmancık · Yenidanişment / Soruk',
          evidence:
            'Güncel bir Çorum İl Özel İdaresi raporu “OSMANCIK Yenidanişment/Soruk” kaydını ayrıca verir.',
          reading: 'Osmancık’ta günümüzde ayrı olarak kayıtlı bir Soruk yeridir.',
        },
        {
          place: 'Osmancık · Tekmen, Karataş ve Saltık/Saltuk',
          evidence:
            'Serhat Soruklu bu yerleri baba tarafı aile bağlamı olarak tanımlar; kamuya açık kayıtlar da Soruklu adını Tekmen ve Karataş ile ilişkilendirir.',
          reading: 'Aileye özgü nüfus, mezarlık ve tapu araştırması için öncelikli bölgedir.',
        },
        {
          place: 'Osmancık–Vezirköprü–Bafra hattı',
          evidence:
            '1959 dosyası Soruk’u Osmancık sınırına yerleştirir; yerel haber Osmancık yönüne hareketten söz eder ve kamu kayıtlarında daha geniş hatta Soruklu görülür.',
          reading: 'Makul bir bölgesel izdir; henüz güvenilir bir soyadı dağılımı ölçülmemiştir.',
        },
      ],
      noteLabel: 'Aileden bilinen doğrudan bağlam',
      note: 'Tekmen, Karataş ve Saltık/Saltuk bilinen baba tarafı bağlamıdır. Araştırma, kayıt yeri bilinen en eski atadan medeni ve Osmanlı nüfus kayıtlarında geriye gitmelidir.',
    },
    population: {
      kicker: 'Yerel aile bilgisi',
      heading: 'Nadir bir soyadının yaşayan izi',
      introduction:
        'Mevcut rakamlar resmî bir soyadı sayımına değil, yerel aile bilgisine dayanan yaklaşık tahminlerdir. Bu bilgiler hem Tekmen köyünün zaman içinde değişen hane sayısını hem de göçlerle genişleyen Soruk ve Soruklu soyadı çevresini anlatır.',
      measureHeading: 'Ölçü',
      accountHeading: 'Yerel anlatı',
      boundaryHeading: 'Kanıt sınırı',
      rows: [
        {
          measure: 'Günümüzdeki soyadı tahmini',
          account:
            'Yerel aile bilgisine göre bugün yaklaşık 500 kişinin Soruklu soyadını taşıdığı tahmin edilmektedir.',
          boundary: 'Yaklaşık bir yerel tahmindir; resmî bir ulusal sayı değildir.',
        },
        {
          measure: 'Günümüzdeki köy hane sayısı',
          account:
            'Tekmen’de bugün yaklaşık 150 hane bulunduğu, ancak bu hanelerin tamamının Soruk veya Soruklu soyadını taşımadığı belirtilmektedir.',
          boundary: 'Köy hane tahminidir; Soruklu ailelerinin sayısı değildir.',
        },
        {
          measure: '1950’lerdeki köy büyüklüğü',
          account:
            'Tekmen’de 1950’li yıllarda yaklaşık 500 hane bulunduğu hatırlanmaktadır; ancak bu hanelerin soyadı dağılımı bilinmemektedir.',
          boundary: 'Hatırlanan hane sayısıdır; her hanede kullanılan soyadını göstermez.',
        },
        {
          measure: 'Tekmen dışındaki Osmancık aileleri',
          account:
            'Servet Köroğlu, Tekmen’de yaşayanlar hariç olmak üzere Osmancık’ta Soruk veya Soruklu soyadını taşıyan en az 10 aileyi şahsen tanıdığını belirtmektedir.',
          boundary:
            'Kendisinin yerel bilgisidir; bağımsız olarak doğrulanmış bir aile sayısı değildir.',
        },
        {
          measure: 'Göç ve soyadı kullanımı',
          account:
            'Servet Köroğlu’nun yerel anlatımına göre başka yerlere göç eden aileler arasında Soruk veya Soruklu soyadlarının kullanımı yaygındır.',
          boundary:
            'Her göç edenin bu soyadlarından birini aldığı veya bütün ailelerin tek bir soydan geldiği anlamına gelmez.',
        },
        {
          measure: 'Yenidanişment ve Soruk Mahallesi',
          account:
            'Servet Köroğlu’nun yerel anlatımına göre Yenidanişment köyü Soruk’tan gelen aileler tarafından kurulmuş, Soruk adı da günümüzde bu köye bağlı bir mahallede yaşamaya devam etmiştir.',
          boundary:
            'Yenidanişment/Soruk adı güncel resmî kayıtta yer almaktadır; ancak köyün Soruk’tan gelen aileler tarafından kurulduğu yönündeki göç ve kuruluş anlatısı henüz bağımsız arşiv kayıtlarıyla doğrulanmamıştır.',
        },
      ],
      evidenceLabel: 'Yerel anlatı · yaklaşık ve bağımsız olarak sayılmamış',
      attribution:
        'Bu yerel tahminler, Osmancık’ın Tekmen köyünde muhtarlık yapmış olan Servet Köroğlu tarafından aktarılmıştır. Osmancık Kaymakamlığının 31 Mart 2017 tarihli resmî kaydı, kendisini Tekmen Köyü muhtarı olarak tanımlamaktadır. Nüfus ve soyadı rakamları yerel tahmin niteliğindedir ve henüz eksiksiz bir resmî soyadı veya nüfus kaydıyla doğrulanmamıştır.',
      workingEstimateLabel: 'Çalışma tahmini · düşük güven',
      workingEstimate:
        'Çok kaba bir demografik değerlendirme, 1934’ten bugüne Soruklu soyadını taşımış toplam kişi sayısının birkaç bin düzeyinde olabileceğini düşündürmektedir. Eksiksiz bir resmî sayı henüz bulunmamıştır.',
    },
    unknown: {
      kicker: 'Kanıtlanmamış noktalar',
      heading: 'Kanıtın açık bir sınırı var.',
      introduction:
        'Bu sorular aileye özgü medeni ve arşiv kayıtları gerektirir; çıkarımla cevaplanamaz.',
      items: [
        'Modern Soruklu ailelerinin Soruk Bey’den doğrudan geldiği.',
        'Soruk Bey’in veya yerleşimin kesin Orta Çağ tarihi.',
        'Kanık ve Kınık’ın burada aktarım çeşidi olup olmadığı.',
        'Sorukluzâde araştırma ipucunun doğruluğu.',
        'Bir ailenin Soruklu soyadını ne zaman ve nasıl aldığı.',
        'Vezirköprü Soruk, Osmancık Soruk, Tekmen veya Bafra arasındaki soy güzergâhı.',
        'Arma, asalet, hanedan veya mirasla geçen yetki iddiaları.',
      ],
      boundary:
        'Soyadının desteklenebilir bir anlamı ve belgeli bölgesel geçmişi, ihtimali soy kütüğüne dönüştürmeden de anlamlıdır.',
    },
    sources: {
      kicker: 'Kaynak notları',
      heading: 'Açıklamanın dayandığı kanıtlar.',
      introduction:
        'Aşağıdaki bağlantılar bu sayfada kullanılan, erişilebilen en güçlü kaynaklara gider. Dış belgeler yeni sekmede açılır.',
      actionLabel: 'Kaynağı aç',
      actionAriaSuffix: 'yeni sekmede açılır',
      titleTooltip: 'Harici kaynağı yeni sekmede açar',
      items: [
        {
          number: '01',
          title: 'Terim Sorunları ve Terim Yapma Yolları',
          authority: 'Türk Dil Kurumu · Hamza Zülfikar · 2025 baskısı',
          description: '-lı / -li / -lu / -lü eklerini ve yer bağlantılı örnekleri açıklar.',
          url: sourceUrls.suffix,
        },
        {
          number: '02',
          title: 'Tahrir Defterlerine Göre Vezirköprü Yöresinde İskân ve Nüfus (1485–1576)',
          authority: 'Belleten · Mehmet Öz',
          description: 'Sorukderesi’ni yaklaşık 1520 ve 1576’da gösteren tabloyu yayımlar.',
          url: sourceUrls.registers,
        },
        {
          number: '03',
          title: 'Evliya Çelebi in Vezirköprü, 1648',
          authority: 'Cedrus IX · Tønnes Bekker-Nielsen · 2021',
          description: 'Súrúk adını aktarır ve güzergâhın birinci el güvenilirliğini inceler.',
          url: sourceUrls.evliya,
        },
        {
          number: '04',
          title: 'Amasya Tarihi, 1–4. ciltler, sayfa 170',
          authority: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddîn Yasar',
          description: 'Soruklu Hâfız Ali Efendi’nin görevini, dönüşünü ve ölümünü kaydeder.',
          url: sourceUrls.sorukluHafizAli,
        },
        {
          number: '05',
          title: 'Amasya Tarihi, 1–4. ciltler, sayfa 200',
          authority: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddîn Yasar',
          description: 'Soruk köylerini Soruk Bey, Karalı ve Kanık ile ilişkilendirir.',
          url: sourceUrls.sorukBey,
        },
        {
          number: '06',
          title: 'Kırsal Kalkınma Amaçlı Hibe Projelerinin Değerlendirilmesi: TR83 Bölgesi Örneği',
          authority: 'Tarım Bakanlığı araştırma yayını · TEPGE · yayın 270',
          description: '1200’ler, Kınık ve Yörük beyi ayrıntılarını yerel rivayet olarak kaydeder.',
          url: sourceUrls.oralTradition,
        },
        {
          number: '07',
          title: 'Amasya İstiklal Mahkemesi, cilt 12/1',
          authority: 'Türkiye Büyük Millet Meclisi · yayımlanmış mahkeme kayıtları',
          description: 'Soruk köylülerini Soyadı Kanunu öncesi hane/sülale adlarıyla kaydeder.',
          url: sourceUrls.earlyRepublic,
        },
        {
          number: '08',
          title: 'Cumhuriyet Arşivi Çorum Belgeleri Kataloğu',
          authority: 'Çorum Belediyesi kültür yayını · 2017 · sayfa 195–196',
          description:
            'Vezirköprü Soruk ve Osmancık Gökdere’ye ait 1959 sınır kayıtlarını kataloglar.',
          url: sourceUrls.boundaryArchive,
        },
        {
          number: '09',
          title: 'Sarıdibek Köyünde 3000 Dönüm Arazi Çöl Haline Geldi',
          authority: 'Vezirköprü Vatandaş · 1974 haberi, 2024’te yeniden yayımlandı',
          description:
            'Sarıdibek’i eski adı Soruk ile tanımlar ve Osmancık yönüne hareketi aktarır.',
          url: sourceUrls.localReport,
        },
        {
          number: '10',
          title: 'Çorum İl Özel İdaresi 2024 Yılı Faaliyet Raporu',
          authority: 'Resmî kamu idaresi raporu',
          description: 'Osmancık’taki Yenidanişment/Soruk kaydını ayrıca verir.',
          url: sourceUrls.currentOsmancik,
        },
        {
          number: '11',
          title: 'Vezirköprü: Genel Bakış',
          authority: 'Vezirköprü Ticaret ve Sanayi Odası',
          description: 'Sarıdibek ile Tahtaköprü’yü Soruk Vadisi içinde tanımlar.',
          url: sourceUrls.sorukValley,
        },
        {
          number: '12',
          title: 'Tekmen ve Karataş için kamuya açık kayıt örneği',
          authority: 'Çorum Haber · yerel kamu duyurusu · 2023',
          description: 'Soruklu soyadını Tekmen ve Karataş ile ilişkilendiren bir kamu kaydıdır.',
          url: sourceUrls.tekmenPublic,
        },
        {
          number: '13',
          title: 'Bafra Belediyesi 2024 Yılı Faaliyet Raporu',
          authority: 'Bafra Belediyesi · resmî kamu raporu',
          description: 'Bafra’da Soruklu soyadının geçtiği resmî bir kamu kaydıdır.',
          url: sourceUrls.bafraPublic,
        },
        {
          number: '14',
          title:
            'Araştırmacı Yazar Salim Savcı ve Tekmen Köyü Muhtarı Servet Köroğlu Sayın Kaymakamımızı Ziyaret Etti',
          authority: 'Osmancık Kaymakamlığı · 31 Mart 2017',
          description:
            'Servet Köroğlu’nu Mart 2017’de Osmancık’a bağlı Tekmen Köyü muhtarı olarak resmen tanımlar ve yerel anlatının kişiye atfını destekler.',
          url: sourceUrls.servetKoroglu,
        },
      ],
    },
    relationship: {
      kicker: 'Ayrı bir konu',
      heading: 'Soyadı ile Soruklu Order ayrı konulardır.',
      description:
        'Soruklu Order, 2025’te kurulmuş, aile mirasını korumaya yönelik küçük ve gönüllü bir girişimdir. Soruklu soyadını taşıyan herkes adına konuşmaz, onları tanımlamaz veya temsil etmez.',
      action: 'Soruklu Order hakkında okuyun',
      actionAriaLabel:
        'Soruklu Order hakkında okuyun — 2025’te kurulan ayrı ve gönüllü bir girişim',
    },
    closing: {
      kicker: 'Anlamı özenle taşımak',
      heading: 'Bir ad, kanıtın sınırını aşmadan da ayırt edici olabilir.',
      description:
        'Soruklu, açık bir Türkçe yapıya, Osmanlı dönemine uzanan yer adı izine ve 1934 öncesi belgeli kişi kullanımına sahiptir. Aileye özgü hat, bulunmayı bekleyen kayıtlara açıktır.',
      homeAction: 'Serhat Soruklu’ya dön',
      orderAction: 'Soruklu Order’ı inceleyin',
      orderAriaLabel: 'Soruklu Order’ı inceleyin — ayrı ve gönüllü bir girişim',
    },
  },
} as const;

@Component({
  selector: 'app-soruklu-surname',
  imports: [PathIconComponent, RouterLink, TooltipDirective],
  templateUrl: './soruklu-surname.component.html',
  styleUrl: './soruklu-surname.component.css',
})
export class SorukluSurnameComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly seoService = inject(SeoService);
  private readonly languageState = inject(SorukluSurnameLanguageService);
  private readonly saridibekDialog = inject(SaridibekDialogService);

  readonly language = this.languageState.language;
  readonly content = computed(() => surnameContent[this.language()]);
  readonly cursorClickIcon = mdiCursorDefaultClickOutline;
  readonly imageSearchIcon = mdiImageSearchOutline;
  readonly mapMarkerIcon = mdiMapMarkerOutline;
  readonly photoAssets = saridibekPhotoAssets;
  readonly timelineIcons = [
    mdiFileDocumentOutline,
    mdiHomeGroup,
    mdiBookOpenPageVariantOutline,
    mdiSchoolOutline,
    mdiAccountGroupOutline,
    mdiMapMarkerPath,
    mdiNewspaperVariantOutline,
    mdiMapClockOutline,
  ] as const;

  ngOnInit(): void {
    const savedLanguage = this.readSavedLanguage();

    if (savedLanguage) {
      this.language.set(savedLanguage);
    }

    this.applyLanguageMetadata();
  }

  ngOnDestroy(): void {
    this.document.documentElement.lang = 'en';
  }

  toggleLanguage(): void {
    this.language.update((language) => (language === 'en' ? 'tr' : 'en'));
    this.saveLanguage(this.language());
    this.applyLanguageMetadata();
  }

  openSaridibekDialog(): void {
    void this.saridibekDialog.open();
  }

  private applyLanguageMetadata(): void {
    const content = this.content();

    this.document.documentElement.lang = content.htmlLang;
    this.seoService.setMetadata({
      title: content.seo.title,
      description: content.seo.description,
      canonicalUrl: pageSeoMetadata.sorukluSurname.path,
      ogImage: pageSeoMetadata.sorukluSurname.ogImage,
      ogImageAlt: pageSeoMetadata.sorukluSurname.ogImageAlt,
      ogImageHeight: pageSeoMetadata.sorukluSurname.ogImageHeight,
      ogImageType: pageSeoMetadata.sorukluSurname.ogImageType,
      ogImageWidth: pageSeoMetadata.sorukluSurname.ogImageWidth,
      locale: this.language() === 'tr' ? 'tr_TR' : 'en_GB',
      robots: 'index, follow',
    });
  }

  private readSavedLanguage(): SurnameLanguage | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const value = this.document.defaultView?.sessionStorage.getItem(languageStorageKey);

      return value === 'en' || value === 'tr' ? value : null;
    } catch {
      return null;
    }
  }

  private saveLanguage(language: SurnameLanguage): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      this.document.defaultView?.sessionStorage.setItem(languageStorageKey, language);
    } catch {
      // The switch remains functional when storage is unavailable.
    }
  }
}
