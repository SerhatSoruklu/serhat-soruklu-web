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
} as const;

const surnameContent = {
  en: {
    htmlLang: 'en-GB',
    seo: pageSeoMetadata.sorukluSurname,
    switchLabel: 'Türkçe oku',
    switchAriaLabel: 'Türkçe oku — read this page in Turkish',
    eyebrow: 'A name rooted in place',
    title: 'What does Soruklu mean?',
    lead: 'Soruklu is a distinctive Turkish surname with a clear linguistic structure and a regional record that reaches back into the Ottoman period.',
    introduction:
      'The strongest supportable interpretation is place-based: a person or family associated with, belonging to, or originating from Soruk. The historical trail is real; a continuous bloodline is not yet proven.',
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
    timeline: {
      kicker: 'Documentary timeline',
      heading: 'The name appears in records across centuries.',
      introduction:
        'The surviving evidence follows a place name. It does not, on its own, establish a continuous modern genealogy.',
      yearLabel: 'Year',
      entries: [
        {
          date: 'c. 1520',
          label: 'Ottoman register study',
          title: 'Sorukderesi appears as a mezraa.',
          description:
            'A study using register TT 387 lists Sorukderesi in the Göl district with six nefer. Nefer is a register unit for taxable males, not the total population. The blank 1485 column means only that this study did not list the place under that name for that register.',
        },
        {
          date: '1576',
          label: 'Ottoman register study',
          title: 'Sorukderesi is recorded as a village.',
          description:
            'The same study lists the settlement as a karye, or village, with 55 nefer. This gives the Soruk place name a firm sixteenth-century documentary footprint.',
        },
        {
          date: '1648',
          label: 'Ottoman travel text',
          title: 'Soruk appears in the Seyahatname tradition.',
          description:
            'A modern study of Evliya Çelebi’s Vezirköprü account reproduces the village as Súrúk in the Zeytun district. The place-name evidence is useful, but the same study warns that the western route was probably not travelled first-hand and its timings should not be read as precise mapping.',
        },
        {
          date: '1786–87',
          label: 'Ottoman-period identifier',
          title: '“Soruklu Hâfız Ali Efendi” is named in Amasya Tarihi.',
          description:
            'The work records Soruklu Hâfız Ali Efendi as a Dârü’l-Hadîs müderris in Hijri 1201, restored to the post in 1208 and followed by his son after his death in 1221. This shows Soruklu in pre-1934 personal use, but not yet as a modern statutory surname.',
        },
        {
          date: '1920',
          label: 'Early Republican record',
          title: 'Residents are identified as being from Soruk village.',
          description:
            'Published Amasya Independence Tribunal records name several people from Soruk karyesi by household names such as İsmailoğulları and Değirmencioğulları. They help map village society before the Surname Law; they do not show those residents using Soruklu as a surname.',
        },
        {
          date: '1959',
          label: 'Republic archive catalogue',
          title: 'Soruk and Osmancık’s Gökdere are documented across one boundary.',
          description:
            'A Çorum Municipality archive catalogue lists telegrams, petitions, a decision and a sketch for the boundary dispute between Vezirköprü’s Soruk village and Osmancık’s Gökdere village. It proves geographic adjacency, not a family migration.',
        },
        {
          date: '1974',
          label: 'Local reporting',
          title: 'Sarıdibek is identified by its former name, Soruk.',
          description:
            'A reproduced Vezirköprü newspaper report calls Sarıdibek by its former name, Soruk, and says that some residents moved towards Osmancık and larger cities. It does not identify a particular modern family line.',
        },
        {
          date: 'Present',
          label: 'Current administrative records',
          title: 'Soruk remains visible in two distinct local contexts.',
          description:
            'Sarıdibek and Tahtaköprü remain associated with the Soruk Valley around Vezirköprü, while a current official report separately lists Yenidanişment/Soruk in Osmancık. The shared name does not establish that the two places are one settlement.',
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
            'The productive Turkish suffix -lu expresses association, belonging or place-based origin, and Soruk is independently documented as a place name.',
        },
        {
          index: '02',
          label: 'High confidence · why yes',
          title: 'The Soruk place name is securely Ottoman-period.',
          description:
            'Register-based research records Sorukderesi around 1520 and again in 1576; Evliya Çelebi’s seventeenth-century text preserves Soruk in the same regional landscape.',
        },
        {
          index: '03',
          label: 'Supported · with a limit',
          title: 'Soruklu was used as a personal identifier before 1934.',
          description:
            'Amasya Tarihi records Soruklu Hâfız Ali Efendi in Hijri 1201. This supports an Ottoman nisba or origin-identifier; it does not by itself prove an inherited legal surname or a connection to today’s family.',
        },
        {
          index: '04',
          label: 'Later tradition · plausible',
          title: 'Soruk Bey may explain the settlement name.',
          description:
            'Amasya Tarihi links Soruk villages to Soruk Bey of the Karalı group within the Kanık community. The account is relevant but later than the person or events it describes, so it is not contemporary proof.',
        },
        {
          index: '05',
          label: 'Local tradition · why not proven',
          title: 'The “1200s, Kınık Yörük bey” detail remains tradition.',
          description:
            'A modern ministry research report explicitly introduces the 1200s settlement story and the Kınık Yörük-bey description as rivayet—reported tradition. Amasya Tarihi instead prints Kanık, and no contemporary medieval document has yet settled the date or wording.',
        },
        {
          index: '06',
          label: 'Research lead · not verified',
          title: 'The claimed “Sorukluzâde Râşid Ahmed Efendi” bridge is not used as evidence.',
          description:
            'The supplied research names this person, but the phrase could not be located in the searchable official Amasya Municipality volumes reviewed for this page. It remains a lead until a precise edition, page or scan can be checked.',
        },
        {
          index: '07',
          label: 'Withdrawn · why not',
          title: '“Question” or “inquiry” is not presented as the surname’s origin.',
          description:
            'Older linguistic forms resembling soruk do not establish why Soruk Bey, the settlement or the modern surname carried the name. The place-based reading has a much stronger evidence chain.',
        },
        {
          index: '08',
          label: 'Unproven · records required',
          title: 'Direct descent and the 1934 surname decision remain open.',
          description:
            'A continuous claim needs family-specific population registers, civil records and the earliest formal surname record. Geography and repeated names make a route worth researching, but cannot substitute for those documents.',
        },
      ],
    },
    account: {
      kicker: 'Soruk Bey and the name',
      heading: 'A historical explanation survives—but its date does not.',
      paragraphs: [
        'In Amasya Tarihi, Hüseyin Hüsâmeddîn Yasar writes that Esenli and Karalı groups from the Kanık community lived in the Zeytun district, that Soruk Bey of the Karalı group became known there, and that Soruk villages preserved his name.',
        'A modern agricultural-policy research report records the local tradition more specifically: Soruk was said to have been named after Soruk Bey settled there in the 1200s, and he was said to be a Yörük bey of a Kınık group within Karalı. Because the report marks both details as rivayet, they belong to oral memory rather than the same evidence tier as the sixteenth-century registers.',
        'The Kanık/Kınık difference may be a variant transmission, but no source reviewed here resolves it. Nor do the accessible texts give Soruk Bey’s father, children, grave, office or secure life dates.',
      ],
      wordLabel: 'What this can support',
      wordNote:
        'Soruk Bey is a documented later historical explanation for the place name. He is not yet a documented ancestor of the modern Soruklu family.',
    },
    geography: {
      kicker: 'Places and family context',
      heading: 'Two Soruk locations; one regional research corridor.',
      introduction:
        'The geography is meaningful, but each location has to remain distinct until records establish a migration or kinship link.',
      placeHeading: 'Place or context',
      evidenceHeading: 'What is documented',
      readingHeading: 'Responsible reading',
      rows: [
        {
          place: 'Vezirköprü · Soruk / Sorukderesi / Sarıdibek',
          evidence:
            'Sixteenth-century tahrir entries, the seventeenth-century Seyahatname text, the 1959 boundary file, the 1974 report and continued use of “Soruk Valley”.',
          reading:
            'Strong continuity for a historical place name. This is the best-documented Soruk location in the research.',
        },
        {
          place: 'Osmancık · Yenidanişment / Soruk',
          evidence:
            'A current Çorum İl Özel İdaresi report separately lists “OSMANCIK Yenidanişment/Soruk”.',
          reading:
            'A real present-day Soruk locality in Osmancık; not proof that it is the same settlement as Vezirköprü’s Soruk.',
        },
        {
          place: 'Osmancık · Tekmen, Karataş and Saltık/Saltuk',
          evidence:
            'Serhat Soruklu identifies this as his paternal family context and has visited the places repeatedly. Public regional references also associate the surname with Tekmen and Karataş.',
          reading:
            'A high-priority location for family-specific registry, cemetery and land research; personal knowledge is not, by itself, an archival bridge to Soruk Bey or Vezirköprü.',
        },
        {
          place: 'Osmancık–Vezirköprü–Bafra corridor',
          evidence:
            'The 1959 file proves that Vezirköprü’s Soruk met the Osmancık boundary, while local reporting records movement towards Osmancık and public records show Soruklu instances across the wider corridor.',
          reading:
            'A plausible regional footprint, not a measured surname distribution and not proof of one migration route.',
        },
      ],
      noteLabel: 'First-hand family context',
      note: 'Tekmen, Karataş and Saltık/Saltuk are retained because they are part of Serhat Soruklu’s known paternal context. The next evidential step is to start with the earliest named paternal ancestor and registered locality, then work backwards through civil and Ottoman population records.',
    },
    unknown: {
      kicker: 'What remains unproven',
      heading: 'The evidence has a clear boundary.',
      introduction:
        'These questions require family-specific civil, property, military, cemetery, or archival records. They should not be resolved by inference alone.',
      items: [
        'Direct descent of any modern Soruklu family from Soruk Bey.',
        'A precise medieval date for Soruk Bey or the foundation of the settlement.',
        'Whether Kanık and Kınık in the two accounts are simply variant transmissions in this case.',
        'Whether the unlocated Sorukluzâde research lead is accurate.',
        'The exact date and circumstances in which a particular family adopted Soruklu as a formal surname.',
        'A confirmed genealogical route between Vezirköprü’s Soruk, Osmancık’s Soruk, Tekmen or Bafra.',
        'Any claim of heraldry, nobility, dynasty, or inherited authority.',
      ],
      boundary:
        'The surname has a supportable linguistic meaning and a documented regional history. Those facts are meaningful without turning possibility into pedigree.',
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
          description:
            'Explains the long-established functions of -lı / -li / -lu / -lü and includes place-association examples.',
          url: sourceUrls.suffix,
        },
        {
          number: '02',
          title: 'Tahrir Defterlerine Göre Vezirköprü Yöresinde İskân ve Nüfus (1485–1576)',
          authority: 'Belleten · Mehmet Öz',
          description:
            'Publishes the register-based table in which Sorukderesi appears around 1520 and again in 1576.',
          url: sourceUrls.registers,
        },
        {
          number: '03',
          title: 'Evliya Çelebi in Vezirköprü, 1648',
          authority: 'Cedrus IX · Tønnes Bekker-Nielsen · 2021',
          description:
            'Reproduces the Súrúk place-name in the Seyahatname tradition and critically assesses which route details were likely first-hand.',
          url: sourceUrls.evliya,
        },
        {
          number: '04',
          title: 'Amasya Tarihi, volumes 1–4, page 170',
          authority: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddîn Yasar',
          description:
            'Records Soruklu Hâfız Ali Efendi as a Dârü’l-Hadîs müderris from Hijri 1201 and notes his later return and death.',
          url: sourceUrls.sorukluHafizAli,
        },
        {
          number: '05',
          title: 'Amasya Tarihi, volumes 1–4, page 200',
          authority: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddîn Yasar',
          description:
            'Presents the later historical account connecting Soruk villages with Soruk Bey of the Karalı group within the Kanık community.',
          url: sourceUrls.sorukBey,
        },
        {
          number: '06',
          title: 'Kırsal Kalkınma Amaçlı Hibe Projelerinin Değerlendirilmesi: TR83 Bölgesi Örneği',
          authority: 'Ministry of Agriculture research publication · TEPGE · publication 270',
          description:
            'Records the 1200s, Kınık and Yörük-bey details explicitly as local tradition rather than contemporary documentary fact.',
          url: sourceUrls.oralTradition,
        },
        {
          number: '07',
          title: 'Amasya İstiklal Mahkemesi, volume 12/1',
          authority: 'Grand National Assembly of Türkiye · published court records',
          description:
            'Names early Republican residents from Soruk village by their household identifiers, useful for pre-surname social context.',
          url: sourceUrls.earlyRepublic,
        },
        {
          number: '08',
          title: 'Cumhuriyet Arşivi Çorum Belgeleri Kataloğu',
          authority: 'Çorum Municipality cultural publication · 2017 · pages 195–196',
          description:
            'Catalogues the 1959 telegrams, petitions, decision and boundary sketch involving Vezirköprü Soruk and Osmancık Gökdere.',
          url: sourceUrls.boundaryArchive,
        },
        {
          number: '09',
          title: 'Sarıdibek Köyünde 3000 Dönüm Arazi Çöl Haline Geldi',
          authority: 'Vezirköprü Vatandaş · 1974 report reproduced in 2024',
          description:
            'Identifies Sarıdibek by the former name Soruk and reports migration by some residents towards Osmancık and larger cities.',
          url: sourceUrls.localReport,
        },
        {
          number: '10',
          title: 'Çorum İl Özel İdaresi 2024 Yılı Faaliyet Raporu',
          authority: 'Official public-administration report',
          description:
            'Separately lists Yenidanişment/Soruk in Osmancık, confirming the current locality without merging it with Vezirköprü’s Soruk.',
          url: sourceUrls.currentOsmancik,
        },
        {
          number: '11',
          title: 'Vezirköprü: Genel Bakış',
          authority: 'Vezirköprü Chamber of Commerce and Industry',
          description:
            'Describes Sarıdibek and Tahtaköprü in the valley still known as Soruk Valley.',
          url: sourceUrls.sorukValley,
        },
        {
          number: '12',
          title: 'Tekmen and Karataş public-record example',
          authority: 'Çorum Haber · local public notice · 2023',
          description:
            'Provides one public example connecting the Soruklu surname with Tekmen and Karataş; it is evidence of presence, not origin or descent.',
          url: sourceUrls.tekmenPublic,
        },
        {
          number: '13',
          title: 'Bafra Municipality 2024 Activity Report',
          authority: 'Bafra Municipality · official public report',
          description:
            'Provides an official public example of the Soruklu surname in Bafra; it cannot measure frequency or establish kinship.',
          url: sourceUrls.bafraPublic,
        },
      ],
    },
    relationship: {
      kicker: 'A separate subject',
      heading: 'The surname is older than the Soruklu Order.',
      description:
        'The Soruklu Order is a small, voluntary family stewardship initiative established in 2025. It does not own, define, or represent everyone who shares the surname.',
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
    eyebrow: 'Kökeni bir yere dayanan ad',
    title: 'Soruklu ne anlama geliyor?',
    lead: 'Soruklu, dilbilimsel yapısı açık ve bölgesel izi Osmanlı dönemine uzanan ayırt edici bir Türk soyadıdır.',
    introduction:
      'Kanıtlarla en güçlü biçimde desteklenebilen yorum yer bağlantılıdır: Soruk’tan olan, Soruk’a mensup ya da Soruk kökenli kişi veya aile. Tarihî iz gerçektir; kesintisiz kan bağı henüz kanıtlanmış değildir.',
    formationLabel: 'Adın yapısı',
    formationAriaLabel: 'Soruk ve lu eki Soruklu adını oluşturur',
    formationMeaning: 'Bağlantı, mensubiyet veya köken',
    photo: saridibekPhotoContent.tr,
    meaning: {
      kicker: 'Doğrudan anlam',
      heading: 'Bir yer adı ve ardından bağlantı bildiren bir ek.',
      paragraphs: [
        'Soruk köktür. -lu eki; sahiplik, ilişki veya bağlantı bildiren Türkçe -lı / -li / -lu / -lü ek ailesine aittir. Türk Dil Kurumu bu kullanıma Bağdatlı, Mısırlı ve Vanlı gibi yer bağlantısı bildiren örnekler verir.',
        'Bu yerleşik yapıya göre Soruklu, en doğal biçimde Soruk’la bağlantılı kişi anlamına gelir. Bu, sağlam bir dilbilimsel yorumdur; tek başına bir soy ağacı değildir.',
      ],
      noteLabel: 'Kanıtlarla en güçlü biçimde desteklenen okuma',
      note: 'Soruk’la bağlantılı, Soruk’a mensup veya Soruk kökenli kişi ya da aile.',
    },
    timeline: {
      kicker: 'Belgesel zaman çizgisi',
      heading: 'Ad, yüzyıllara yayılan kayıtlarda görülüyor.',
      introduction:
        'Günümüze ulaşan kanıt bir yer adını takip eder. Bu kanıt, tek başına kesintisiz bir modern soy bağı kurmaz.',
      yearLabel: 'Sene',
      entries: [
        {
          date: 'Yaklaşık 1520',
          label: 'Osmanlı tahrir araştırması',
          title: 'Sorukderesi bir mezraa olarak geçiyor.',
          description:
            'TT 387 defterini kullanan bir çalışma, Göl nahiyesindeki Sorukderesi’ni altı neferle kaydeder. Buradaki nefer toplam nüfus değil, vergiye tabi erkekler için kullanılan kayıt birimidir. 1485 sütununun boş olması yalnızca çalışmanın o defterde bu adla kayıt göstermediği anlamına gelir.',
        },
        {
          date: '1576',
          label: 'Osmanlı tahrir araştırması',
          title: 'Sorukderesi bir köy olarak kaydediliyor.',
          description:
            'Aynı çalışma yerleşimi 55 neferli bir karye, yani köy olarak gösterir. Böylece Soruk yer adının 16. yüzyılda belgeli olduğu anlaşılır.',
        },
        {
          date: '1648',
          label: 'Osmanlı seyahat metni',
          title: 'Soruk, Seyahatname geleneğinde geçiyor.',
          description:
            'Evliya Çelebi’nin Vezirköprü anlatısını inceleyen modern bir çalışma, Zeytun kazasındaki köyü Súrúk biçiminde aktarır. Yer adı tanıklığı değerlidir; ancak aynı çalışma batı güzergâhının muhtemelen bizzat gezilmediğini ve saatlerin kesin harita ölçüsü gibi kullanılamayacağını belirtir.',
        },
        {
          date: '1786–87',
          label: 'Osmanlı dönemi kişi tanımı',
          title: 'Amasya Tarihi’nde “Soruklu Hâfız Ali Efendi” adı geçiyor.',
          description:
            'Eser, Hicrî 1201’de Soruklu Hâfız Ali Efendi’yi Dârü’l-Hadîs müderrisi olarak kaydeder; 1208’de göreve yeniden geldiğini ve 1221’deki ölümünden sonra oğlunun geçtiğini bildirir. Bu, Soruklu’nun 1934 öncesi kişi tanımı olarak kullanımını gösterir; modern resmî soyadı olduğunu göstermez.',
        },
        {
          date: '1920',
          label: 'Erken Cumhuriyet kaydı',
          title: 'Soruk köyü sakinleri sülale adlarıyla kaydediliyor.',
          description:
            'Yayımlanmış Amasya İstiklal Mahkemesi kayıtlarında Soruk karyesinden kişiler İsmailoğulları ve Değirmencioğulları gibi hane/sülale adlarıyla tanımlanır. Kayıtlar Soyadı Kanunu öncesi köy toplumunu anlamaya yardım eder; bu kişilerin Soruklu soyadını kullandığını göstermez.',
        },
        {
          date: '1959',
          label: 'Cumhuriyet arşiv kataloğu',
          title: 'Soruk ile Osmancık’ın Gökdere köyü aynı sınırda belgeleniyor.',
          description:
            'Çorum Belediyesi arşiv kataloğu, Vezirköprü Soruk ile Osmancık Gökdere arasındaki sınır ihtilafına ait telgraf, dilekçe, karar ve krokiyi listeler. Bu kayıt coğrafi komşuluğu kanıtlar; bir ailenin göçünü kanıtlamaz.',
        },
        {
          date: '1974',
          label: 'Yerel haber',
          title: 'Sarıdibek, eski adı Soruk olarak tanımlanıyor.',
          description:
            'Yeniden yayımlanan bir Vezirköprü gazete haberi, Sarıdibek’i eski adı Soruk ile anıyor ve bazı sakinlerin Osmancık’a ve büyük şehirlere göç ettiğini aktarıyor. Haber belirli bir modern aile hattını tanımlamıyor.',
        },
        {
          date: 'Günümüz',
          label: 'Güncel idari kayıtlar',
          title: 'Soruk, iki ayrı yer bağlamında yaşamaya devam ediyor.',
          description:
            'Sarıdibek ve Tahtaköprü, Vezirköprü çevresindeki Soruk Vadisi ile anılmayı sürdürürken güncel resmî bir rapor Osmancık’ta ayrıca Yenidanişment/Soruk kaydını verir. Ortak ad, iki yerin aynı yerleşim olduğunu kanıtlamaz.',
        },
      ],
    },
    records: {
      kicker: 'Kanıt denetimi',
      heading: 'Neye varılabilir, neye varılamaz?',
      introduction:
        'Araştırmadaki her önemli iddia burada korunur; ancak her birinin durumu, dayandığı kaynağın gerçekte neyi gösterebildiğine göre belirlenir.',
      items: [
        {
          index: '01',
          label: 'Yüksek güven · neden evet',
          title: 'Soruklu en doğal biçimde “Soruk’la bağlantılı” demektir.',
          description:
            'Üretken Türkçe -lu eki ilişki, mensubiyet veya yer kökeni bildirir; Soruk da bağımsız olarak belgelenmiş bir yer adıdır.',
        },
        {
          index: '02',
          label: 'Yüksek güven · neden evet',
          title: 'Soruk yer adı güvenle Osmanlı dönemine uzanır.',
          description:
            'Tahrir araştırması Sorukderesi’ni yaklaşık 1520’de ve 1576’da kaydeder; Evliya Çelebi’nin 17. yüzyıl metni de Soruk’u aynı bölgesel çevrede korur.',
        },
        {
          index: '03',
          label: 'Destekli · sınırıyla birlikte',
          title: 'Soruklu, 1934’ten önce kişi tanımı olarak kullanılmıştır.',
          description:
            'Amasya Tarihi, Hicrî 1201’de Soruklu Hâfız Ali Efendi’yi kaydeder. Bu, Osmanlı döneminde nisbe veya köken belirten bir tanımı destekler; miras kalan resmî soyadı ya da bugünkü aileyle bağ kurmaz.',
        },
        {
          index: '04',
          label: 'Sonraki anlatı · makul',
          title: 'Yerleşim adını Soruk Bey açıklıyor olabilir.',
          description:
            'Amasya Tarihi, Soruk köylerini Kanık topluluğu içindeki Karalı oymağından Soruk Bey ile ilişkilendirir. Anlatı değerlidir; fakat anlattığı kişi veya olaylarla çağdaş olmadığı için tek başına kesin kanıt değildir.',
        },
        {
          index: '05',
          label: 'Yerel rivayet · neden kanıt değil',
          title: '“1200’ler, Kınık Yörük beyi” ayrıntısı rivayet düzeyindedir.',
          description:
            'Modern bir bakanlık araştırma raporu hem 1200’lerde yerleşme anlatısını hem de Kınık Yörük beyi tanımını açıkça rivayet olarak verir. Amasya Tarihi ise Kanık yazar; tarihi ve aktarımı kesinleştiren çağdaş bir Orta Çağ belgesi henüz yoktur.',
        },
        {
          index: '06',
          label: 'Araştırma ipucu · doğrulanmadı',
          title: '“Sorukluzâde Râşid Ahmed Efendi” bağlantısı kanıt zincirine alınmadı.',
          description:
            'Verilen araştırma bu kişiyi adlandırıyor; ancak ifade, bu sayfa için incelenen Amasya Belediyesinin aranabilir resmî dijital ciltlerinde bulunamadı. Kesin baskı, sayfa veya tarama görülene kadar yalnızca bir araştırma ipucudur.',
        },
        {
          index: '07',
          label: 'Geri çekildi · neden değil',
          title: '“Soru” veya “sorgu” soyadının kökeni olarak sunulmuyor.',
          description:
            'Soruk’a benzeyen eski dil biçimleri, Soruk Bey’in, yerleşimin veya modern soyadının neden bu adı taşıdığını göstermez. Yer bağlantılı okuma çok daha güçlü bir kanıt zincirine sahiptir.',
        },
        {
          index: '08',
          label: 'Kanıtlanmadı · kayıt gerekli',
          title: 'Doğrudan soy ve 1934’teki soyadı kararı açıkta duruyor.',
          description:
            'Kesintisiz bir iddia için aileye özgü nüfus kayıtları, medeni kayıtlar ve en eski resmî soyadı belgesi gerekir. Coğrafya ve tekrar eden adlar araştırmaya değer bir hat kurar; bu belgelerin yerini tutmaz.',
        },
      ],
    },
    account: {
      kicker: 'Soruk Bey ve adın kökeni',
      heading: 'Tarihî bir açıklama var; fakat kesin tarihi yok.',
      paragraphs: [
        'Hüseyin Hüsâmeddîn Yasar, Amasya Tarihi’nde Zeytun kazasında Kanık topluluğundan Esenli ve Karalı oymaklarının yaşadığını, Karalı oymağından Soruk Bey’in tanındığını ve Soruk köylerinin onun adını koruduğunu yazar.',
        'Modern bir tarım politikası araştırma raporu yerel anlatıyı daha ayrıntılı kaydeder: Soruk’un 1200’lerde Soruk Bey’in yerleşmesiyle adlandırıldığı ve onun Karalı içindeki bir Kınık grubunun Yörük beyi olduğu söylenir. Rapor iki ayrıntıyı da rivayet olarak işaretlediği için bunlar, 16. yüzyıl tahrir kayıtlarıyla aynı kanıt düzeyinde değildir.',
        'Kanık/Kınık farkı bir aktarım çeşidi olabilir; ancak burada incelenen kaynaklar bunu çözmüyor. Erişilebilen metinler Soruk Bey’in babasını, çocuklarını, mezarını, görevini veya güvenli yaşam tarihlerini de vermiyor.',
      ],
      wordLabel: 'Bu anlatının destekleyebildiği',
      wordNote:
        'Soruk Bey, yer adının kökenine ilişkin belgeli bir sonraki dönem tarihî açıklamadır. Modern Soruklu ailesinin belgeli atası değildir.',
    },
    geography: {
      kicker: 'Yerler ve aile bağlamı',
      heading: 'İki Soruk yeri; tek bir bölgesel araştırma hattı.',
      introduction:
        'Coğrafya anlamlıdır; fakat göç veya akrabalık kaydı bulunana kadar her yer ayrı tutulmalıdır.',
      placeHeading: 'Yer veya bağlam',
      evidenceHeading: 'Belgelenen',
      readingHeading: 'Sorumlu yorum',
      rows: [
        {
          place: 'Vezirköprü · Soruk / Sorukderesi / Sarıdibek',
          evidence:
            '16. yüzyıl tahrir kayıtları, 17. yüzyıl Seyahatname metni, 1959 sınır dosyası, 1974 haberi ve “Soruk Vadisi” adının devam eden kullanımı.',
          reading:
            'Tarihî bir yer adı için güçlü süreklilik. Araştırmadaki en iyi belgelenmiş Soruk yeridir.',
        },
        {
          place: 'Osmancık · Yenidanişment / Soruk',
          evidence:
            'Güncel bir Çorum İl Özel İdaresi raporu “OSMANCIK Yenidanişment/Soruk” kaydını ayrıca verir.',
          reading:
            'Osmancık’ta günümüzde var olan gerçek bir Soruk yeridir; Vezirköprü Soruk ile aynı yerleşim olduğunu kanıtlamaz.',
        },
        {
          place: 'Osmancık · Tekmen, Karataş ve Saltık/Saltuk',
          evidence:
            'Serhat Soruklu burayı baba tarafı aile bağlamı olarak tanımlar ve bu yerleri defalarca ziyaret etmiştir. Kamuya açık bölgesel kayıtlar da soyadını Tekmen ve Karataş ile ilişkilendirir.',
          reading:
            'Aileye özgü nüfus, mezarlık ve tapu araştırması için öncelikli bölgedir; kişisel bilgi tek başına Soruk Bey’e veya Vezirköprü’ye uzanan arşiv köprüsü değildir.',
        },
        {
          place: 'Osmancık–Vezirköprü–Bafra hattı',
          evidence:
            '1959 dosyası Vezirköprü Soruk’un Osmancık sınırına dayandığını kanıtlar; yerel haber Osmancık yönüne hareketten söz eder ve kamu kayıtlarında daha geniş hatta Soruklu örnekleri görülür.',
          reading:
            'Makul bir bölgesel izdir; ölçülmüş soyadı dağılımı veya kanıtlanmış tek bir göç güzergâhı değildir.',
        },
      ],
      noteLabel: 'Birinci el aile bağlamı',
      note: 'Tekmen, Karataş ve Saltık/Saltuk; Serhat Soruklu’nun bilinen baba tarafı bağlamının parçası oldukları için korunmuştur. Bir sonraki kanıt adımı, adı ve kayıt yeri bilinen en eski baba tarafı atadan başlayıp medeni ve Osmanlı nüfus kayıtlarında geriye gitmektir.',
    },
    unknown: {
      kicker: 'Kanıtlanmamış noktalar',
      heading: 'Kanıtın açık bir sınırı var.',
      introduction:
        'Bu sorular aileye özgü nüfus, tapu, askerlik, mezarlık veya arşiv kayıtları gerektirir. Yalnızca çıkarımla cevaplanmamalıdır.',
      items: [
        'Günümüzdeki herhangi bir Soruklu ailesinin Soruk Bey’den doğrudan geldiği.',
        'Soruk Bey’in veya yerleşimin kesin Orta Çağ tarihi.',
        'İki anlatıdaki Kanık ve Kınık ifadelerinin bu örnekte yalnızca aktarım çeşidi olup olmadığı.',
        'Kaynağı bulunamayan Sorukluzâde araştırma ipucunun doğru olup olmadığı.',
        'Belirli bir ailenin Soruklu adını resmî soyadı olarak aldığı kesin tarih ve koşullar.',
        'Vezirköprü Soruk, Osmancık Soruk, Tekmen veya Bafra arasında doğrulanmış bir soy güzergâhı.',
        'Herhangi bir arma, asalet, hanedan veya miras yoluyla geçen yetki iddiası.',
      ],
      boundary:
        'Soyadının desteklenebilir bir dilbilimsel anlamı ve belgeli bir bölgesel geçmişi vardır. Bu gerçekler, ihtimali soy kütüğüne dönüştürmeden de anlamlıdır.',
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
          description:
            '-lı / -li / -lu / -lü eklerinin yerleşik işlevlerini açıklar ve yer bağlantısı bildiren örnekler verir.',
          url: sourceUrls.suffix,
        },
        {
          number: '02',
          title: 'Tahrir Defterlerine Göre Vezirköprü Yöresinde İskân ve Nüfus (1485–1576)',
          authority: 'Belleten · Mehmet Öz',
          description:
            'Sorukderesi’nin yaklaşık 1520’de ve 1576’da yer aldığı tahrir kayıtlarına dayalı tabloyu yayımlar.',
          url: sourceUrls.registers,
        },
        {
          number: '03',
          title: 'Evliya Çelebi in Vezirköprü, 1648',
          authority: 'Cedrus IX · Tønnes Bekker-Nielsen · 2021',
          description:
            'Seyahatname geleneğindeki Súrúk yer adını aktarır ve güzergâh ayrıntılarından hangilerinin birinci elden olabileceğini eleştirel biçimde inceler.',
          url: sourceUrls.evliya,
        },
        {
          number: '04',
          title: 'Amasya Tarihi, 1–4. ciltler, sayfa 170',
          authority: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddîn Yasar',
          description:
            'Soruklu Hâfız Ali Efendi’yi Hicrî 1201’den itibaren Dârü’l-Hadîs müderrisi olarak kaydeder; dönüşünü ve ölümünü de bildirir.',
          url: sourceUrls.sorukluHafizAli,
        },
        {
          number: '05',
          title: 'Amasya Tarihi, 1–4. ciltler, sayfa 200',
          authority: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddîn Yasar',
          description:
            'Soruk köylerini Kanık topluluğu içindeki Karalı oymağından Soruk Bey ile ilişkilendiren sonraki dönem tarihî anlatıyı sunar.',
          url: sourceUrls.sorukBey,
        },
        {
          number: '06',
          title: 'Kırsal Kalkınma Amaçlı Hibe Projelerinin Değerlendirilmesi: TR83 Bölgesi Örneği',
          authority: 'Tarım Bakanlığı araştırma yayını · TEPGE · yayın 270',
          description:
            '1200’ler, Kınık ve Yörük beyi ayrıntılarını çağdaş belge olarak değil, açıkça yerel rivayet olarak kaydeder.',
          url: sourceUrls.oralTradition,
        },
        {
          number: '07',
          title: 'Amasya İstiklal Mahkemesi, cilt 12/1',
          authority: 'Türkiye Büyük Millet Meclisi · yayımlanmış mahkeme kayıtları',
          description:
            'Erken Cumhuriyet döneminde Soruk köyünden kişileri hane/sülale adlarıyla kaydeder ve Soyadı Kanunu öncesi toplumsal bağlam sağlar.',
          url: sourceUrls.earlyRepublic,
        },
        {
          number: '08',
          title: 'Cumhuriyet Arşivi Çorum Belgeleri Kataloğu',
          authority: 'Çorum Belediyesi kültür yayını · 2017 · sayfa 195–196',
          description:
            'Vezirköprü Soruk ile Osmancık Gökdere’yi ilgilendiren 1959 tarihli telgraf, dilekçe, karar ve sınır krokisini kataloglar.',
          url: sourceUrls.boundaryArchive,
        },
        {
          number: '09',
          title: 'Sarıdibek Köyünde 3000 Dönüm Arazi Çöl Haline Geldi',
          authority: 'Vezirköprü Vatandaş · 1974 haberi, 2024’te yeniden yayımlandı',
          description:
            'Sarıdibek’i eski adı Soruk ile tanımlar ve bazı sakinlerin Osmancık ile büyük şehirlere göçünü aktarır.',
          url: sourceUrls.localReport,
        },
        {
          number: '10',
          title: 'Çorum İl Özel İdaresi 2024 Yılı Faaliyet Raporu',
          authority: 'Resmî kamu idaresi raporu',
          description:
            'Osmancık’taki Yenidanişment/Soruk kaydını ayrıca vererek güncel yerleşimi doğrular; Vezirköprü Soruk ile birleştirmez.',
          url: sourceUrls.currentOsmancik,
        },
        {
          number: '11',
          title: 'Vezirköprü: Genel Bakış',
          authority: 'Vezirköprü Ticaret ve Sanayi Odası',
          description:
            'Sarıdibek ile Tahtaköprü’yü bugün de Soruk Vadisi olarak anılan vadi içinde tanımlar.',
          url: sourceUrls.sorukValley,
        },
        {
          number: '12',
          title: 'Tekmen ve Karataş için kamuya açık kayıt örneği',
          authority: 'Çorum Haber · yerel kamu duyurusu · 2023',
          description:
            'Soruklu soyadını Tekmen ve Karataş ile ilişkilendiren bir kamu kaydı örneği sunar; köken veya soy bağı kanıtı değildir.',
          url: sourceUrls.tekmenPublic,
        },
        {
          number: '13',
          title: 'Bafra Belediyesi 2024 Yılı Faaliyet Raporu',
          authority: 'Bafra Belediyesi · resmî kamu raporu',
          description:
            'Bafra’da Soruklu soyadına ilişkin resmî bir kamu örneği verir; sıklığı ölçmez ve akrabalık kurmaz.',
          url: sourceUrls.bafraPublic,
        },
      ],
    },
    relationship: {
      kicker: 'Ayrı bir konu',
      heading: 'Soyadı, Soruklu Order’dan daha eskidir.',
      description:
        'Soruklu Order, 2025’te kurulmuş küçük ve gönüllü bir aile emanetçiliği girişimidir. Soyadını taşıyan herkesi sahiplenmez, tanımlamaz veya temsil etmez.',
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
