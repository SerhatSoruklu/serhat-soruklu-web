import { DOCUMENT, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
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
import {
  evliyaDocumentAssets,
  evliyaDocumentContent,
  evliyaDocumentDialogData,
} from './evliya-document.content';
import {
  kamusDictionaryAssets,
  kamusDictionaryContent,
  kamusDictionaryDialogData,
} from './kamus-dictionary.content';
import { SaridibekDialogService } from './saridibek-dialog/saridibek-dialog.service';
import { saridibekPhotoAssets, saridibekPhotoContent } from './saridibek-photo.content';
import { SorukluSurnameLanguageService } from './soruklu-surname-language.service';
import type { SurnameLanguage } from './soruklu-surname-language.service';

const languageStorageKey = 'serhatsoruklu-surname-language';
const sourceUrls = {
  suffix:
    'https://tdk.gov.tr/wp-content/uploads/2011/12/Terim-Sorunlari-ve-Terim-Yapma-Yollari-_2025_-WEB.pdf',
  registers: 'https://belleten.gov.tr/tam-metin-pdf/2265/tur',
  vezirkopruResearch:
    'https://www.cevdetyilmaz.com.tr/wp-content/uploads/2014-VEZIRKOPRU-ARASTIRMALARI.pdf',
  evliya: 'https://dergipark.org.tr/en/download/article-file/1849989',
  gokcegiz:
    'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page128.html',
  sorukBey: 'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page200.html',
  sorukluHafizAli: 'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page170.html',
  gokcegizAtabeg:
    'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page338.html',
  huseyinHusameddin: 'https://islamansiklopedisi.org.tr/huseyin-husameddin-yasar',
  tacizadeCafer: 'https://islamansiklopedisi.org.tr/tacizade-cafer-celebi',
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
  suciSertkaya: 'https://tdkbelleten.gov.tr/eng/full-text-pdf/637/tur',
  oldTurkicDoublets: 'https://dergipark.org.tr/tr/download/article-file/741630',
  archaicSoruk: 'https://tdkbelleten.gov.tr/eng/full-text/1065/tur',
  kamusSoruk: 'https://www.osmanlicasozlukler.com/kamusiturki/tafsil-262580-cv2.html',
  evliyaEdition: 'https://archive.org/details/evliyaelebisey02evliuoft/page/n90/mode/1up',
  evliyaBiography: 'https://islamansiklopedisi.org.tr/evliya-celebi',
} as const;

const surnameContent = {
  en: {
    htmlLang: 'en-GB',
    seo: pageSeoMetadata.sorukluSurname,
    switchLabel: 'Türkçe oku',
    switchAriaLabel: 'Türkçe oku — read this page in Turkish',
    eyebrow: 'A surname most plausibly connected with place',
    title: 'What does Soruklu mean?',
    lead: 'Soruk + -lu gives the surname a clear Turkish morphological structure.',
    introduction:
      'Soruklu is a distinctive Turkish surname with a clear morphological structure. The strongest supportable reading connects it with the documented place name Soruk. That reading does not establish why any particular family adopted the surname or prove descent from a historical figure.',
    formationLabel: 'Morphological reading',
    formationAriaLabel: 'Soruk plus lu forms Soruklu',
    formationMeaning: 'Connected with Soruk',
    dictionary: kamusDictionaryContent.en,
    document: evliyaDocumentContent.en,
    photo: saridibekPhotoContent.en,
    meaning: {
      kicker: 'Morphological reading',
      heading: 'A place name, followed by a marker of connection.',
      paragraphs: [
        'Soruk is the root. The suffix -lu belongs to the Turkish -lı / -li / -lu / -lü family and expresses association, belonging or place-based origin. Soruklu therefore most naturally means “connected with Soruk.” This is the strongest morphological interpretation, not proof of why a particular family adopted the surname.',
      ],
      noteLabel: 'Strongest supportable reading',
      note: 'Someone or a family associated with, belonging to, or originating from Soruk.',
    },
    quickSummary: {
      heading: 'What we know in 30 seconds',
      items: [
        'Soruklu most naturally means connected with Soruk.',
        'Published register research lists Sorukderesi as a mezraa with no registered population in 1485.',
        'Sorukderesi had six registered nefer around 1520 and was listed as a karye with 55 nefer in 1576.',
        'Amasya Tarihi preserves two Soruk or Soruk Bey traditions that should currently be treated separately.',
        'One tradition identifies Soruk Bey as the father of Bahâeddîn Gökceğiz, reportedly active around H.575/1179–80.',
        'Amasya Tarihi calls a person in the H.1201/1786–87 context “Soruklu Hâfız Ali Efendi”; the underlying appointment record has not yet been examined directly.',
        'Direct descent from either figure to modern Soruklu families remains unproven.',
      ],
    },
    timeline: {
      kicker: 'Documentary timeline',
      heading: 'The evidence develops across distinct kinds of historical record.',
      introduction:
        'Each entry states what the source supports and where its evidential boundary lies. Together they do not form a continuous family record.',
      yearLabel: 'Year',
      entries: [
        {
          date: 'H.575 / 1179–80',
          category: 'Seljuk-period context reported by a later historian',
          title: 'Soruk is identified as the father of Bahâeddîn Gökceğiz.',
          body:
            'Amasya Tarihi describes Bahâeddîn Gökceğiz as a Salur figure associated with events around H.575/1179–80. Elsewhere, the work uses the expressions “Gökceğiz Veled Soruk” and “Soruk Beyzâde Bahâeddîn Gökceğiz Bey,” identifying his father as Soruk or Soruk Bey.',
          limitation:
            'The underlying medieval record has not yet been independently identified. The Soruk Bey in this account may have been different from the figure described in the Karalı/Kanık tradition.',
          evidenceLabel: 'Later historical account',
        },
        {
          date: '1485',
          category: 'Published Ottoman-register research',
          title: 'Sorukderesi is listed as a mezraa with no registered population.',
          body:
            'Mehmet Öz’s published table lists Sorukderesi as a named mezraa with no registered population in 1485.',
          limitation:
            'According to Mehmet Öz’s published register research, Sorukderesi was represented in the 1485 survey. The entry does not prove that no buildings, cultivation, seasonal use or earlier occupation existed.',
          evidenceLabel: 'Published register research',
        },
        {
          date: 'c. 1520',
          category: 'Published Ottoman-register research',
          title: 'Six nefer are registered under Sorukderesi.',
          body:
            'The same study lists Sorukderesi in the Göl district as a mezraa with six registered nefer.',
          limitation:
            'This is a tahrir registration figure, not the settlement’s complete population.',
          evidenceLabel: 'Published register research',
        },
        {
          date: '1576',
          category: 'Published Ottoman-register research',
          title: 'Sorukderesi is recorded as a karye.',
          body: 'Sorukderesi is listed as a karye, or village, with 55 registered nefer in 1576.',
          limitation:
            'This documents settlement development and continuity of the place name. It does not establish Soruk Bey’s lifetime or identity.',
          evidenceLabel: 'Published register research',
        },
        {
          date: '1648',
          category: 'Ottoman travel-text tradition',
          title: 'Soruk appears as a standalone place name.',
          body:
            'A modern study of Evliya Çelebi’s Vezirköprü account reproduces the standalone form Súrúk in the route through the Zeytun district.',
          limitation:
            'The study cautions that this part of the route may not have been travelled first-hand. The reference belongs to the Seyahatname textual and printing tradition.',
          evidenceLabel: 'Travel-text tradition',
        },
        {
          date: 'H.1201 / 1786–87',
          category: 'Ottoman-period identifier reported by a later history',
          title: '“Soruklu Hâfız Ali Efendi” is named.',
          body:
            'Amasya Tarihi retrospectively identifies a Dârü’l-Hadîs teacher appointed in H.1201 as “Soruklu Hâfız Ali Efendi.”',
          limitation:
            'This supports a pre-1934 textual use of Soruklu as a personal or origin identifier. The underlying eighteenth-century appointment record has not yet been examined.',
          evidenceLabel: 'Later historical account',
        },
        {
          date: '1920',
          category: 'Turkish National Movement / TBMM-period record',
          title: 'Soruk villagers are identified through household and lineage names.',
          body:
            'Published Amasya Independence Tribunal records identify Soruk villagers through household or lineage names including İsmailoğulları and Değirmencioğulları.',
          limitation:
            'The records describe village society before the Surname Law but do not show these residents using Soruklu as a formal surname.',
          evidenceLabel: 'Published court records',
        },
        {
          date: '1959',
          category: 'Republic archive catalogue',
          title: 'Soruk and Osmancık’s Gökdere share a documented boundary.',
          body:
            'A Çorum archive catalogue lists telegrams, petitions, a decision and a sketch concerning the boundary dispute between Vezirköprü’s Soruk village and Osmancık’s Gökdere village.',
          limitation:
            'This establishes geographical adjacency, not shared ancestry, common founding or a connection to Yenidanişment/Soruk.',
          evidenceLabel: 'Archive catalogue',
        },
        {
          date: '1974',
          category: 'Local newspaper report',
          title: 'Sarıdibek is identified by its former name, Soruk.',
          body:
            'A Vezirköprü newspaper report calls Sarıdibek by its former name Soruk and reports that some residents moved towards Osmancık and larger cities.',
          limitation:
            'This supports continuity of the local name and reported migration towards Osmancık. It does not establish a specific genealogical route to modern Soruklu families.',
          evidenceLabel: 'Local reporting',
        },
        {
          date: 'Present',
          category: 'Current administrative and regional records',
          title: 'Soruk survives in two distinct local contexts.',
          body:
            'Sarıdibek and Tahtaköprü remain associated with the Soruk Valley around Vezirköprü, while a current official record separately lists Yenidanişment/Soruk in Osmancık.',
          limitation:
            'These are separate localities. No reviewed source establishes a shared founding population, migration history or genealogy.',
          evidenceLabel: 'Modern administrative continuity',
        },
      ],
    },
    registerSummary: {
      label: 'Published register research',
      body:
        'Mehmet Öz’s published table lists Sorukderesi as a mezraa with no registered population in 1485, with six registered nefer around 1520, and as a karye with 55 registered nefer in 1576. These are register figures, not complete population counts.',
      boundary:
        'This page reports Mehmet Öz’s published research. The original handwritten TT.d 37 folio containing Sorukderesi has not been directly examined for this revision, so its Ottoman spelling, exact folio and surrounding entry are not claimed as independently verified here.',
    },
    registerNotes: [
      {
        title: 'What “M. Sorukderesi” means',
        body:
          'In the 2014 republication, the table legend gives K as karye, meaning village, and M as mezraa, glossed there as ekinlik. “M. Sorukderesi” therefore identifies Sorukderesi as a named mezraa or cultivation locality in the table, not merely an unnamed meadow. The classification does not by itself prove active cultivation, buildings or permanent occupation in 1485.',
        context: null,
        label: 'Register terminology',
      },
      {
        title: 'How the place name Sorukderesi can be read',
        body:
          'Sorukderesi is formed from Soruk + dere + the Turkish compound ending -si. Dere can refer to a stream, creek, watercourse, streambed or the small valley or channel associated with one. The name can therefore be read naturally as “Soruk stream or creek” or “the stream-valley associated with Soruk.” This is a linguistic and topographic reading, not proof of the original naming event or the exact watercourse intended in 1485.',
        context:
          'The 2014 Vezirköprü Araştırmaları volume also uses the regional expressions “Sarıdibek (Soruk) havzası” and “Soruk Vadisi.” This supports continuing regional use of Soruk in a valley context, not a direct identification of the fifteenth-century mezraa’s exact boundaries.',
        label: 'Linguistic and topographic reading',
      },
    ],
    rootMeaning: {
      kicker: 'Etymological comparison',
      heading: 'The lexical origin of Soruk remains unresolved',
      body:
        'Historical forms such as Old Turkic sorug and Ottoman Turkish soruk have been interpreted in senses including fame, renown, question and inquiry. No reviewed etymological study connects those words with the personal name Soruk, Soruk Bey or the regional place name.',
      label: 'Etymological comparison · low confidence',
    },
    records: {
      kicker: 'Evidence audit',
      heading: 'What can—and cannot—be concluded.',
      introduction:
        'Every major claim from the research is retained here, but its status depends on what the underlying source can actually establish.',
      items: [
        {
          index: '01',
          label: 'High confidence · linguistic structure',
          title: 'Soruklu most naturally means “connected with Soruk.”',
          description:
            'The Turkish suffix -lu expresses association, belonging or place-based origin, while Soruk is independently documented as a place name. This morphological reading does not by itself establish a particular family history.',
        },
        {
          index: '02',
          label: 'High confidence · published register research',
          title: 'The Soruk name element is documented in the form Sorukderesi from at least 1485.',
          description:
            'Mehmet Öz’s published table lists Sorukderesi as a mezraa with no registered population in 1485, a mezraa with six nefer around 1520, and a karye with 55 nefer in 1576.',
        },
        {
          index: '03',
          label: 'Supported · underlying record not yet reviewed',
          title: 'A pre-Surname Law personal use of “Soruklu” is reported in Amasya Tarihi.',
          description:
            'Amasya Tarihi calls a person in the H.1201/1786–87 context “Soruklu Hâfız Ali Efendi.” The underlying eighteenth-century appointment record has not yet been examined directly.',
        },
        {
          index: '04',
          label: 'Later historical account · significant lead',
          title: 'Soruk is identified as the father of Bahâeddîn Gökceğiz.',
          description:
            'Amasya Tarihi uses “Gökceğiz Veled Soruk” and associates Bahâeddîn Gökceğiz with the Salur and events around H.575/1179–80. Within the work’s narrative, this supports a late-twelfth-century figure having a father named Soruk. The underlying medieval record remains unidentified.',
        },
        {
          index: '05',
          label: 'Internal textual support within the same source',
          title: 'Gökceğiz’s father is identified as Soruk Bey.',
          description:
            'Another passage calls him “Soruk Beyzâde Bahâeddîn Gökceğiz Bey” and reports an appointment as atabeg after H.575. This strengthens the internal reading of the father as Soruk Bey, but it is not independent corroboration.',
        },
        {
          index: '06',
          label: 'Separate naming tradition · undated',
          title:
            'A Karalı/Kanık figure called Soruk Bey is associated with the settlement named Soruk.',
          description:
            'Amasya Tarihi names Soruk Bey among the Karalı in Zeytun and attributes the settlement name Soruk to him. The passage gives no date and does not identify this person with Gökceğiz’s father.',
        },
        {
          index: '07',
          label: 'Local tradition · not independent evidence',
          title: 'The “1200s, Kınık Yörük bey” detail remains a tradition.',
          description:
            'The TEPGE report explicitly presents this account as rivayet. It is not independent medieval corroboration.',
        },
        {
          index: '08',
          label: 'Research lead · identity unresolved',
          title: 'The identity of the emin named Tâceddin remains unresolved.',
          description:
            'Same-period references exist to an emin named Tâceddin, Gedeğra zaimi Tâceddin Beğ, a Tâceddin Beğ associated with Göl revenues, Tâcî Bey and a vakfiye-associated İbrahim Paşa. No reviewed source establishes that they were the same person or identifies any of them as the emin responsible for TT.d 37.',
        },
        {
          index: '09',
          label: 'Etymological comparison · low confidence',
          title: 'The lexical origin of Soruk remains unresolved.',
          description:
            'Historical forms such as Old Turkic sorug and Ottoman Turkish soruk have been interpreted in senses including fame, renown, question and inquiry. No reviewed etymological study connects those words with the personal name Soruk, Soruk Bey or the regional place name.',
        },
        {
          index: '10',
          label: 'Unproven · family records required',
          title: 'Direct descent from Soruk Bey to modern Soruklu families has not been established.',
          description:
            'Continuous descent requires family-specific population, civil, cemetery, land and early surname records. Place names, migration traditions and repeated names cannot establish genealogy by themselves.',
        },
      ],
    },
    account: {
      kicker: 'Later historical accounts',
      heading: 'The Soruk Bey traditions',
      introduction:
        'Amasya Tarihi preserves two accounts involving men called Soruk or Soruk Bey in different tribal and geographical contexts. None of the reviewed passages explicitly identifies them as the same person. They should therefore remain separate unless another source establishes a connection.',
      items: [
        {
          title: 'The Karalı, Kanık and Zeytun tradition',
          body:
            'In its account of Zeytun, Amasya Tarihi mentions Esenli and Karalı communities associated with Kanık, names a figure called Soruk Bey among Karalı, and attributes the name of the settlement Soruk to him.',
          support:
            'What it supports: A later historical tradition connected a Karalı/Kanık figure called Soruk Bey with the naming of the settlement Soruk.',
          limitation:
            'What it does not support: The passage provides no date, identifies no contemporary source, and does not state that this figure was the father of Bahâeddîn Gökceğiz.',
          label: 'Undated later naming tradition',
        },
        {
          title: '“Gökceğiz Veled Soruk”',
          body:
            'Elsewhere, the work records the phrase “Gökceğiz Veled Soruk,” meaning “Gökceğiz, son of Soruk.” The surrounding account describes Bahâeddîn Gökceğiz as a Salur figure associated with events around H.575/1179–80.',
          support:
            'What it supports: Within the author’s account, a figure associated with the late twelfth century had a father named Soruk.',
          limitation:
            'What it does not support: This passage alone does not give the father the title Bey, identify the underlying medieval document, or connect him to the settlement named Soruk.',
          label: 'Later historical account reporting older material',
        },
        {
          title: '“Soruk Beyzâde Bahâeddîn Gökceğiz Bey”',
          body:
            'Another passage calls the same figure “Soruk Beyzâde Bahâeddîn Gökceğiz Bey” and reports that he was appointed atabeg after H.575.',
          support:
            'What it supports: The work’s internal wording supports the interpretation that the Soruk named as Gökceğiz’s father was understood by the author as Soruk Bey.',
          limitation:
            'What it does not support: No independently identified medieval document has yet confirmed the wording, office, chronology or biography.',
          label: 'Internal textual support within the same later source',
        },
      ],
      conclusion:
        'The Gökceğiz passages form an internally consistent account of a father called Soruk or Soruk Bey within Amasya Tarihi. The Zeytun passage preserves a separate Karalı/Kanık naming tradition. The Karalı/Kanık figure and the Salur father may conceivably have been the same person, but no reviewed source establishes this. Neither account has yet been connected through evidence to Sorukderesi or to present-day Soruklu families.',
    },
    taceddin: {
      heading: 'The unresolved Tâceddin question',
      title: 'The identity of the 1485 survey official remains unresolved.',
      body:
        'Mehmet Öz states that the 1485 survey was conducted by an emin named Tâceddin. The same body of Vezirköprü research separately identifies an influential Gedeğra zaim called Tâceddin Beğ and records a Tâceddin Beğ holding divanî revenue from two karyes in the Göl district. A separate study in the 2014 Vezirköprü Araştırmaları volume reports that a 1495 Arabic vakfiye names the founder of the Vezirköprü complex as Hacı Beyzâde Mevlânâ Safiyyüddin oğlu İbrahim Paşa, while a marginal notation is reported to use the form “Tacüddin”. TDV also provides source-critical biographical context for Tâcî Bey, the father of Tâcizâde Câfer Çelebi.',
      limitation:
        'No reviewed source states that the survey emin, Gedeğra zaimi Tâceddin Beğ, the Tâceddin Beğ associated with Göl revenues, Tâcî Bey or the vakfiye-associated İbrahim Paşa were the same person. None has been directly identified as the emin responsible for TT.d 37.',
      label: 'Research lead · identities not established',
    },
    geography: {
      kicker: 'Places and family context',
      heading: 'Two distinct Soruk localities',
      introduction:
        'Vezirköprü’s former Soruk is now known as Sarıdibek. In the same regional context, the name Sorukderesi appears in published register research from 1485. The reviewed sources do not establish whether these names continuously denoted the same administrative settlement. Yenidanişment/Soruk is a separate present-day locality in Osmancık, and no reviewed source establishes a shared founding population, migration history or genealogy between the two localities.',
      placeHeading: 'Place or context',
      evidenceHeading: 'What is documented',
      readingHeading: 'Responsible reading',
      rows: [
        {
          place: 'Vezirköprü · Soruk / Sorukderesi / Sarıdibek',
          evidence:
            'Mehmet Öz’s published register research, Seyahatname, the 1959 boundary file, the 1974 report and the continuing name “Soruk Valley”.',
          reading:
            'The strongest documented regional Soruk place-name context in the research. The evidence does not establish continuous identity of the administrative settlement, population or genealogy.',
        },
        {
          place: 'Osmancık · Yenidanişment / Soruk',
          evidence:
            'A current Çorum İl Özel İdaresi report separately lists “OSMANCIK Yenidanişment/Soruk”.',
          reading:
            'A distinct present-day Soruk locality in Osmancık. Its founding and population history remain separate research questions.',
        },
        {
          place: 'Osmancık · Tekmen, Karataş and Saltık/Saltuk',
          evidence:
            'Serhat Soruklu identifies these places as paternal family context; public references also associate Soruklu with Tekmen and Karataş.',
          reading:
            'A high-priority location for family-specific registry, cemetery and land research.',
        },
        {
          place: 'Osmancık–Vezirköprü–Bafra',
          evidence:
            'The 1959 file places Soruk on the Osmancık boundary; local reporting notes movement towards Osmancık and public records show Soruklu across the wider region.',
          reading: 'Possible research geography · genealogy unproven',
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
            'Servet Köroğlu’s attributed local testimony suggests that approximately 500 living people may carry the Soruklu surname today.',
          boundary:
            'Approximate; not an official national count; not independently verified.',
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
      evidenceLabel:
        'Attributed local testimony · approximate · not an official national count · not independently verified',
      attribution:
        'These local estimates were provided by Servet Köroğlu, who served as muhtar of Tekmen village in Osmancık. An official Osmancık District Governorate record dated 31 March 2017 identifies him as Tekmen Village muhtar. The population and surname figures remain local estimates and have not yet been verified against a complete official surname or population register.',
    },
    unknown: {
      kicker: 'What remains unproven',
      heading: 'The evidence has a clear boundary.',
      introduction:
        'These questions require family-specific civil and archival records, not inference.',
      items: [
        'An independently verified medieval biography of the Soruk Bey described as Gökceğiz’s father.',
        'A secure date and identity for the Karalı/Kanık Soruk Bey.',
        'Whether Gökceğiz’s father and the Karalı/Kanık Soruk Bey were the same person.',
        'A documented connection between either Soruk Bey tradition and Sorukderesi.',
        'Direct descent from either figure to modern Soruklu families.',
        'The identity of the emin named Tâceddin and whether any same-period Tâceddin or İbrahim Paşa reference concerns that official.',
        'When and why a particular family formally adopted Soruklu as a surname.',
        'A proven founding or genealogical link between Vezirköprü Soruk and Osmancık Yenidanişment/Soruk.',
        'Any claim of heraldry, nobility, dynasty or inherited authority.',
      ],
      boundary:
        'The surname has a supportable meaning and documented regional history without turning possibility into pedigree.',
    },
    researchStatus: {
      heading: 'Research status',
      badge: 'Research frozen · 7 August 2026',
      summary:
        'This page is considered stable as of 7 August 2026. Further revisions should be evidence-driven rather than editorial.',
      criteriaIntroduction:
        'Reopen the research only if materially new evidence is found, such as:',
      criteria: [
        'the original TT.d 37 folio or another primary Ottoman record',
        'an independent medieval source concerning Soruk, Soruk Bey, or Bahâeddîn Gökceğiz',
        'evidence securely connecting Sorukderesi, Soruk, and Sarıdibek',
        'family-specific civil, population, cemetery, land, or early surname records',
        'credible evidence resolving the identity of the Tâceddin associated with the 1485 survey',
        'evidence that materially changes one of the current confidence assessments',
      ],
      boundary:
        'Minor wording preferences, repeated secondary sources, or additional local tradition should not by themselves trigger a revision.',
      reviewLabel: 'Last substantive review',
      reviewDate: '7 August 2026',
      statusLabel: 'Status',
      status: 'Frozen pending new evidence',
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
          sourceDetails: 'Turkish Language Association · Hamza Zülfikar · 2025 edition',
          description: 'Explains -lı / -li / -lu / -lü and gives place-association examples.',
          role: 'Linguistic structure',
          url: sourceUrls.suffix,
        },
        {
          number: '02',
          title: 'Tahrir Defterlerine Göre Vezirköprü Yöresinde İskân ve Nüfus (1485–1576)',
          sourceDetails:
            'Mehmet Öz · Belleten · August 1993 · c. 57 · sy. 219 · s. 509–538 · DOI 10.37879/belleten.1993.509 · Table 17 · printed page 536',
          description:
            'Publishes Table 17, listing Sorukderesi as a mezraa with no registered population in 1485, a mezraa with six nefer around 1520, and a karye with 55 nefer in 1576. The article identifies TT 37 pages 571–672 as the Vezirköprü section and states that the 1485 survey was conducted by an emin named Tâceddin.',
          role: 'Published register research',
          url: sourceUrls.registers,
        },
        {
          number: '03',
          title: 'Vezirköprü Araştırmaları',
          sourceDetails:
            'Ed. Cevdet Yılmaz · Vezirköprü Belediyesi Kültür Yayınları No. 2 · 21 March 2014 · ISBN 978-975-94391-1-8 · relevant printed pages 18, 32, 34, 295–297, 468–470',
          description:
            'A collected research volume that republishes Mehmet Öz’s tahrir article with some place-name corrections, gives the legend “M = Mezraa (ekinlik),” contains a source-critical study of the 1495 Taceddin İbrahim Paşa vakfiye, and uses “Sarıdibek (Soruk) havzası” and “Soruk Vadisi” in modern regional context. Its republication of Öz is not independent corroboration of the Sorukderesi row.',
          role: 'Collected research volume · contextual evidence',
          url: sourceUrls.vezirkopruResearch,
        },
        {
          number: '04',
          title: 'Evliya Çelebi in Vezirköprü, 1648',
          sourceDetails: 'Cedrus IX · Tønnes Bekker-Nielsen · 2021',
          description: 'Reproduces Súrúk and critiques the route’s first-hand reliability.',
          role: 'Travel-text tradition',
          url: sourceUrls.evliya,
        },
        {
          number: '05',
          title: 'Amasya Tarihi, 1–4. ciltler, dijital sayfa 128',
          sourceDetails: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddin Yasar',
          description:
            'Records “Gökceğiz Veled Soruk,” identifies Bahâeddîn Gökceğiz with the Salur, and associates him with events around H.575/1179–80.',
          role: 'Later historical account',
          url: sourceUrls.gokcegiz,
        },
        {
          number: '06',
          title: 'Amasya Tarihi, volumes 1–4, digital page 170',
          sourceDetails: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddin Yasar',
          description: 'Records Soruklu Hâfız Ali Efendi’s appointment, return and death.',
          role: 'Later historical account',
          url: sourceUrls.sorukluHafizAli,
        },
        {
          number: '07',
          title: 'Amasya Tarihi, volumes 1–4, digital page 200',
          sourceDetails: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddin Yasar',
          description:
            'Associates the settlement named Soruk with a figure called Soruk Bey in a Karalı/Kanık context.',
          role: 'Undated later naming tradition',
          url: sourceUrls.sorukBey,
        },
        {
          number: '08',
          title: 'Amasya Tarihi, 1–4. ciltler, dijital sayfa 338',
          sourceDetails: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddin Yasar',
          description:
            'Calls the same figure “Soruk Beyzâde Bahâeddîn Gökceğiz Bey” and reports his appointment as atabeg after H.575.',
          role: 'Internal textual support within the same later source',
          url: sourceUrls.gokcegizAtabeg,
        },
        {
          number: '09',
          title: 'HÜSEYİN HÜSÂMEDDİN YASAR',
          sourceDetails: 'TDV İslâm Ansiklopedisi · Turgut Akpınar',
          description:
            'Explains that Hüseyin Hüsâmeddin used manuscripts, court records, vakfiyes, inscriptions and gravestones, while noting scholarly reservations because he often did not identify the source underlying an individual claim and sometimes relied on excessive etymological comparisons.',
          role: 'Source-critical context',
          url: sourceUrls.huseyinHusameddin,
        },
        {
          number: '10',
          title: 'TÂCÎZÂDE CÂFER ÇELEBİ',
          sourceDetails: 'TDV İslâm Ansiklopedisi · İsmail E. Erünsal',
          description:
            'Provides source-critical context for Tâcî Bey, whom biographical sources describe as Şehzade Bayezid’s defterdar and Amasya serasker, while distinguishing family information derived only from Hüseyin Hüsâmeddin from information supported by other biographical sources. It does not identify Tâcî Bey as the survey emin or as the İbrahim Paşa named in the Vezirköprü vakfiye.',
          role: 'Source-critical research lead',
          url: sourceUrls.tacizadeCafer,
        },
        {
          number: '11',
          title: 'Kırsal Kalkınma Amaçlı Hibe Projelerinin Değerlendirilmesi: TR83 Bölgesi Örneği',
          sourceDetails: 'Ministry of Agriculture research publication · TEPGE · publication 270',
          description: 'Labels the 1200s, Kınık and Yörük-bey details as local tradition.',
          role: 'Local tradition',
          url: sourceUrls.oralTradition,
        },
        {
          number: '12',
          title: 'Amasya İstiklal Mahkemesi, volume 12/1',
          sourceDetails: 'Grand National Assembly of Türkiye · published court records',
          description: 'Names Soruk villagers by household identifiers before the Surname Law.',
          role: 'Published court records',
          url: sourceUrls.earlyRepublic,
        },
        {
          number: '13',
          title: 'Cumhuriyet Arşivi Çorum Belgeleri Kataloğu',
          sourceDetails: 'Çorum Municipality cultural publication · 2017 · pages 195–196',
          description:
            'Catalogues the 1959 boundary records for Vezirköprü Soruk and Osmancık Gökdere.',
          role: 'Archive catalogue',
          url: sourceUrls.boundaryArchive,
        },
        {
          number: '14',
          title: 'Sarıdibek Köyünde 3000 Dönüm Arazi Çöl Haline Geldi',
          sourceDetails: 'Vezirköprü Vatandaş · 1974 report reproduced in 2024',
          description:
            'Identifies Sarıdibek as former Soruk and reports movement towards Osmancık.',
          role: 'Local reporting',
          url: sourceUrls.localReport,
        },
        {
          number: '15',
          title: 'Çorum İl Özel İdaresi 2024 Yılı Faaliyet Raporu',
          sourceDetails: 'Official public-administration report',
          description: 'Separately lists Yenidanişment/Soruk in Osmancık.',
          role: 'Modern administrative continuity',
          url: sourceUrls.currentOsmancik,
        },
        {
          number: '16',
          title: 'Vezirköprü: Genel Bakış',
          sourceDetails: 'Vezirköprü Chamber of Commerce and Industry',
          description: 'Places Sarıdibek and Tahtaköprü in Soruk Valley.',
          role: 'Modern regional context',
          url: sourceUrls.sorukValley,
        },
        {
          number: '17',
          title: 'Tekmen and Karataş public-record example',
          sourceDetails: 'Çorum Haber · local public notice · 2023',
          description: 'Documents one public association of Soruklu with Tekmen and Karataş.',
          role: 'Regional surname occurrence',
          url: sourceUrls.tekmenPublic,
        },
        {
          number: '18',
          title: 'Bafra Municipality 2024 Activity Report',
          sourceDetails: 'Bafra Municipality · official public report',
          description: 'Documents one official public occurrence of the Soruklu surname in Bafra.',
          role: 'Regional surname occurrence',
          url: sourceUrls.bafraPublic,
        },
        {
          number: '19',
          title:
            'Researcher and writer Salim Savcı and Tekmen Village muhtar Servet Köroğlu visited the District Governor',
          sourceDetails: 'Osmancık District Governorate · 31 March 2017',
          description:
            'Officially identifies Servet Köroğlu as the muhtar of Tekmen village in Osmancık in March 2017, supporting the attribution of the local testimony.',
          role: 'Local testimony attribution',
          url: sourceUrls.servetKoroglu,
        },
        {
          number: '20',
          title: 'Suuci < Sugeci / (Bel) Yazıtı Ne Zaman Yazıldı?',
          sourceDetails:
            'Turkish Language Association · Osman Fikri Sertkaya · 2000 · pages 307–312; relevant page 311',
          description:
            'Transcribes “Küm surug(ı)m” in the Süci inscription and translates the clause with “fame” and “renown”.',
          role: 'Etymological comparison',
          url: sourceUrls.suciSertkaya,
        },
        {
          number: '21',
          title: 'Eski Türk Yazıt ve El Yazmalarında İkilemeler',
          sourceDetails:
            'Journal of Old Turkic Studies · Erhan Aydın and Ahmet Karaman · 2019 · page 267',
          description:
            'Classifies kü sorug among synonymous pairings and glosses the pair as “fame, renown”.',
          role: 'Etymological comparison',
          url: sourceUrls.oldTurkicDoublets,
        },
        {
          number: '22',
          title: 'Kazakça Ağızlar Sözlüğü’nde Kayıtlı Bazı Eskicil Sözcükler Üzerine',
          sourceDetails:
            'Turkish Language Association · Sherubay Kurmanbaiuly, Marlen Adilov and Zhumagali İbragimov · 2022 · page 181',
          description:
            'Provides the competing “questions” gloss for Süci sorug and records related inquiry and search senses.',
          role: 'Etymological comparison',
          url: sourceUrls.archaicSoruk,
        },
        {
          number: '23',
          title: 'Kâmûs-ı Türkî: soruk',
          sourceDetails: 'Şemseddin Sami · digitised dictionary entry · page 838',
          description:
            'Supplies the page-838 facsimile entry and records the Ottoman Turkish word soruk with the equivalents sual and pürsiş.',
          role: 'Direct access to historical lexicography · etymological comparison',
          url: sourceUrls.kamusSoruk,
        },
        {
          number: '24',
          title: 'Evliya Çelebi Seyahatnamesi, volume 2, printed page 402',
          sourceDetails:
            'İkdam Matbaası · 1896 · University of Toronto scan hosted by Internet Archive · public domain',
          description:
            'The Ottoman-script printed page visibly preserves صوروق in the route from Göl towards Zeytun.',
          role: 'Direct access to printed travel text',
          url: sourceUrls.evliyaEdition,
        },
        {
          number: '25',
          title: 'Evliya Çelebi',
          sourceDetails: 'TDV İslâm Ansiklopedisi · Mücteba İlgürel',
          description:
            'Provides the biographical basis for the short profile of the Ottoman traveller and his ten-volume Seyahatname.',
          role: 'Source-critical context',
          url: sourceUrls.evliyaBiography,
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
        'Soruklu carries a clear Turkish structure, an Ottoman-period place-name trail and a personal descriptor reported in a pre-Surname Law context. The underlying appointment record remains unexamined, and the family-specific line remains open to records still to be found.',
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
    eyebrow: 'Bir yer adıyla en güçlü biçimde açıklanan soyadı',
    title: 'Soruklu ne anlama geliyor?',
    lead: 'Soruk + -lu yapısı soyadına açık bir Türkçe biçimbilimsel yapı kazandırır.',
    introduction:
      'Soruklu, biçimbilimsel yapısı açık olan ayırt edici bir Türk soyadıdır. Kanıtların desteklediği en güçlü okuma, soyadını belgelenmiş Soruk yer adıyla ilişkilendirir. Bu okuma, belirli bir ailenin soyadını neden benimsediğini veya tarihî bir kişiden geldiğini kanıtlamaz.',
    formationLabel: 'Biçimbilimsel okuma',
    formationAriaLabel: 'Soruk ve lu eki Soruklu adını oluşturur',
    formationMeaning: 'Soruk’la bağlantılı',
    dictionary: kamusDictionaryContent.tr,
    document: evliyaDocumentContent.tr,
    photo: saridibekPhotoContent.tr,
    meaning: {
      kicker: 'Biçimbilimsel okuma',
      heading: 'Bir yer adı ve ardından bağlantı bildiren bir ek.',
      paragraphs: [
        'Soruk köktür. -lu eki Türkçedeki -lı / -li / -lu / -lü ailesindendir ve ilişki, mensubiyet veya yer kökeni bildirir. Bu nedenle Soruklu en doğal biçimde “Soruk’la bağlantılı” demektir. Bu, en güçlü biçimbilimsel yorumdur; belirli bir ailenin soyadını neden aldığını kanıtlamaz.',
      ],
      noteLabel: 'Kanıtlarla en güçlü biçimde desteklenen okuma',
      note: 'Soruk’la bağlantılı, Soruk’a mensup veya Soruk kökenli kişi ya da aile.',
    },
    quickSummary: {
      heading: '30 saniyede bildiklerimiz',
      items: [
        'Soruklu en doğal biçimde Soruk’la bağlantılı anlamına gelir.',
        'Yayımlanmış tahrir araştırması Sorukderesi’ni 1485’te kayıtlı nüfusu bulunmayan bir mezraa olarak gösterir.',
        'Sorukderesi yaklaşık 1520’de 6 neferli bir mezraa, 1576’da ise 55 neferli bir karye olarak kaydedilmiştir.',
        'Amasya Tarihi, Soruk veya Soruk Bey adlı kişiler hakkında birbirinden ayrı tutulması gereken iki anlatı aktarır.',
        'Bu anlatılardan biri, Soruk Bey’i H.575/1179–80 civarında etkin olduğu bildirilen Bahâeddîn Gökceğiz’in babası olarak tanımlar.',
        'Amasya Tarihi, H.1201/1786–87 bağlamındaki bir kişiyi “Soruklu Hâfız Ali Efendi” diye anar; dayanak görevlendirme kaydı henüz doğrudan incelenmemiştir.',
        'Modern Soruklu ailelerinin bu kişilerden doğrudan geldiği kanıtlanmamıştır.',
      ],
    },
    timeline: {
      kicker: 'Belgesel zaman çizgisi',
      heading: 'Kanıtlar farklı tarihî kayıt türleri içinde gelişir.',
      introduction:
        'Her kayıt kaynağın neyi desteklediğini ve kanıt sınırını ayrı ayrı gösterir. Birlikte kesintisiz bir aile kaydı oluşturmazlar.',
      yearLabel: 'Sene',
      entries: [
        {
          date: 'H.575 / 1179–80',
          category: 'Daha sonraki bir tarihçide aktarılan Selçuklu dönemi bağlamı',
          title: 'Soruk, Bahâeddîn Gökceğiz’in babası olarak tanımlanıyor.',
          body:
            'Amasya Tarihi, Bahâeddîn Gökceğiz’i Salur mensubu ve H.575/1179–80 civarındaki olaylarla ilişkili bir kişi olarak anlatır. Eserin farklı bölümlerinde “Gökceğiz Veled Soruk” ve “Soruk Beyzâde Bahâeddîn Gökceğiz Bey” ifadeleri kullanılarak babası Soruk veya Soruk Bey olarak gösterilir.',
          limitation:
            'Bu anlatının dayandığı Orta Çağ belgesi henüz bağımsız olarak tespit edilmemiştir. Buradaki Soruk Bey, Karalı/Kanık bağlamında anlatılan diğer Soruk Bey’den farklı bir kişi olabilir.',
          evidenceLabel: 'Daha sonraki tarih anlatısı',
        },
        {
          date: '1485',
          category: 'Yayımlanmış Osmanlı tahrir araştırması',
          title: 'Sorukderesi, kayıtlı nüfusu bulunmayan bir mezraa olarak gösteriliyor.',
          body:
            'Mehmet Öz’ün yayımladığı tahrir tablosu, Sorukderesi’ni 1485 yılında adı bulunan fakat altında kayıtlı nüfus gösterilmeyen bir mezraa olarak kaydeder.',
          limitation:
            'Mehmet Öz’ün yayımladığı tahrir araştırmasına göre Sorukderesi 1485 tahririnde yer alır. Ancak bu kayıt burada ev, yapı, tarım faaliyeti, mevsimlik kullanım veya daha eski iskân bulunmadığını kanıtlamaz.',
          evidenceLabel: 'Yayımlanmış tahrir araştırması',
        },
        {
          date: 'Yaklaşık 1520',
          category: 'Yayımlanmış Osmanlı tahrir araştırması',
          title: 'Sorukderesi’nde altı nefer kaydediliyor.',
          body:
            'Aynı çalışma, Sorukderesi’ni Göl nahiyesinde mezraa statüsünde ve 6 kayıtlı neferle gösterir.',
          limitation:
            'Bu rakam yerleşimin toplam nüfusunu değil, tahrir defterine kaydedilen neferleri ifade eder.',
          evidenceLabel: 'Yayımlanmış tahrir araştırması',
        },
        {
          date: '1576',
          category: 'Yayımlanmış Osmanlı tahrir araştırması',
          title: 'Sorukderesi bir karye olarak kaydediliyor.',
          body:
            'Sorukderesi, 1576 tarihli tahrir araştırmasında 55 kayıtlı neferin bulunduğu bir karye, yani köy olarak gösterilir.',
          limitation:
            'Bu kayıt yerleşimin mezraadan köy statüsüne geçtiğini ve Sorukderesi adının devam ettiğini belgeler. Soruk Bey’in yaşadığı dönemi veya kimliğini göstermez.',
          evidenceLabel: 'Yayımlanmış tahrir araştırması',
        },
        {
          date: '1648',
          category: 'Osmanlı seyahat metni geleneği',
          title: 'Soruk, müstakil bir yer adı olarak geçiyor.',
          body:
            'Evliya Çelebi’nin Vezirköprü anlatısını inceleyen modern bir çalışma, Zeytun kazasındaki güzergâhta müstakil Súrúk biçimini aktarır.',
          limitation:
            'Çalışma güzergâhın bu bölümünün Evliya Çelebi tarafından bizzat gezilmemiş olabileceğini belirtir. Bu nedenle kayıt Seyahatname’nin metin ve baskı geleneği içinde değerlendirilmelidir.',
          evidenceLabel: 'Seyahat metni geleneği',
        },
        {
          date: 'H.1201 / 1786–87',
          category: 'Daha sonraki tarih eserinde aktarılan Osmanlı dönemi kişi tanımı',
          title: '“Soruklu Hâfız Ali Efendi” adı geçiyor.',
          body:
            'Amasya Tarihi, H.1201’de Dârü’l-Hadîs müderrisi olarak görevlendirildiği bildirilen bir kişiyi “Soruklu Hâfız Ali Efendi” olarak tanımlar.',
          limitation:
            'Bu kullanım Soruklu ifadesinin 1934 Soyadı Kanunu’ndan önce bir kişi veya köken tanımı olarak metinde yer aldığını gösterir. Ancak dayanak olan 18. yüzyıl görevlendirme kaydı henüz doğrudan incelenmemiştir.',
          evidenceLabel: 'Daha sonraki tarih anlatısı',
        },
        {
          date: '1920',
          category: 'Millî Mücadele / TBMM dönemi kaydı',
          title: 'Soruk köyü sakinleri hane ve sülale adlarıyla tanımlanıyor.',
          body:
            'Yayımlanmış Amasya İstiklal Mahkemesi kayıtları, Soruk köylülerini İsmailoğulları ve Değirmencioğulları gibi hane veya sülale adlarıyla tanımlar.',
          limitation:
            'Bu kayıtlar Soyadı Kanunu öncesindeki köy toplumunu gösterir; ilgili kişilerin Soruklu’yu resmî soyadı olarak kullandığını kanıtlamaz.',
          evidenceLabel: 'Yayımlanmış mahkeme kayıtları',
        },
        {
          date: '1959',
          category: 'Cumhuriyet arşiv kataloğu',
          title: 'Soruk ile Osmancık’ın Gökdere köyü ortak sınırda belgeleniyor.',
          body:
            'Çorum Belediyesi arşiv kataloğu, Vezirköprü’ye bağlı Soruk köyü ile Osmancık’a bağlı Gökdere köyü arasındaki sınır ihtilafına ilişkin telgraf, dilekçe, karar ve kroki kayıtlarını listeler.',
          limitation:
            'Bu belgeler iki yerin coğrafi olarak komşu olduğunu gösterir. Ortak soy, ortak kuruluş veya Yenidanişment/Soruk ile bağlantı kanıtlamaz.',
          evidenceLabel: 'Arşiv kataloğu',
        },
        {
          date: '1974',
          category: 'Yerel gazete haberi',
          title: 'Sarıdibek, eski adı Soruk olarak tanımlanıyor.',
          body:
            'Vezirköprü’de yayımlanan ve daha sonra yeniden aktarılan bir gazete haberi, Sarıdibek’i eski adı Soruk ile anmakta ve bazı sakinlerin Osmancık’a ve büyük şehirlere göç ettiğini bildirmektedir.',
          limitation:
            'Bu haber yer adının yerel hafızadaki sürekliliğini ve Osmancık yönüne bildirilen göçü destekler. Belirli bir modern Soruklu ailesinin soy güzergâhını kanıtlamaz.',
          evidenceLabel: 'Yerel haber',
        },
        {
          date: 'Günümüz',
          category: 'Güncel idarî ve bölgesel kayıtlar',
          title: 'Soruk adı iki ayrı yer bağlamında yaşamaya devam ediyor.',
          body:
            'Sarıdibek ve Tahtaköprü, Vezirköprü çevresindeki Soruk Vadisi adıyla ilişkilendirilmeyi sürdürmektedir. Güncel bir resmî kayıt ise Osmancık’ta ayrıca Yenidanişment/Soruk adlı farklı bir yerleşim bağlamını göstermektedir.',
          limitation:
            'Bu iki yerleşim ayrı tutulmalıdır. İncelenen hiçbir kaynak ortak kurucu nüfus, ortak göç geçmişi veya ortak soy bağlantısı kurmamaktadır.',
          evidenceLabel: 'Güncel idarî süreklilik',
        },
      ],
    },
    registerSummary: {
      label: 'Yayımlanmış tahrir araştırması',
      body:
        'Mehmet Öz’ün yayımladığı tablo Sorukderesi’ni 1485’te kayıtlı nüfusu bulunmayan bir mezraa, yaklaşık 1520’de 6 neferli bir mezraa ve 1576’da 55 neferli bir karye olarak gösterir. Bunlar toplam nüfus sayıları değil, tahrir kayıtlarında yer alan nefer rakamlarıdır.',
      boundary:
        'Bu sayfa Mehmet Öz’ün yayımlanmış araştırmasını aktarır. Sorukderesi’ni içeren asıl el yazması TT.d 37 varağı bu revizyon kapsamında doğrudan incelenmemiştir; bu nedenle Osmanlıca imla, kesin varak ve çevresindeki kayıt burada bağımsız olarak doğrulanmış sayılmaz.',
    },
    registerNotes: [
      {
        title: '“M. Sorukderesi” ne anlama geliyor?',
        body:
          '2014 yeniden yayımındaki kısaltma açıklamasında K, karye yani köy; M ise mezraa ve parantez içinde ekinlik olarak verilir. Bu nedenle “M. Sorukderesi”, tabloda adı bulunan bir mezraa veya ekinlik birimini gösterir; yalnızca adsız bir çayır anlamına gelmez. Ancak bu sınıflandırma tek başına 1485’te fiilî tarım, yapı veya sürekli iskân bulunduğunu kanıtlamaz.',
        context: null,
        label: 'Tahrir terminolojisi',
      },
      {
        title: 'Sorukderesi yer adı nasıl okunabilir?',
        body:
          'Sorukderesi, Soruk + dere + Türkçedeki birleşik ad eki -si yapısından oluşur. Dere sözcüğü akarsu, küçük dere, su yolu, su yatağı veya bununla ilişkili dar vadi ve kanal anlamlarında kullanılabilir. Bu nedenle ad doğal olarak “Soruk Deresi” ya da Soruk’la ilişkili dere-vadi biçiminde okunabilir. Bu, dilbilimsel ve topoğrafik bir okumadır; adın ilk veriliş sebebini veya 1485’te kastedilen kesin su yolunu kanıtlamaz.',
        context:
          '2014 tarihli Vezirköprü Araştırmaları cildi ayrıca “Sarıdibek (Soruk) havzası” ve “Soruk Vadisi” ifadelerini kullanır. Bu kullanım, Soruk adının vadi bağlamındaki bölgesel devamlılığını destekler; 15. yüzyıl mezraasının kesin sınırlarını doğrudan belirlemez.',
        label: 'Dilbilimsel ve topoğrafik okuma',
      },
    ],
    rootMeaning: {
      kicker: 'Etimolojik karşılaştırma',
      heading: 'Soruk kelimesinin sözlük kökeni henüz çözülememiştir',
      body:
        'Eski Türkçe sorug ve Osmanlı Türkçesi soruk kelimeleri için şan, şöhret, soru ve sorgu gibi farklı anlamlar önerilmiştir. Ancak incelenen hiçbir etimolojik çalışma bu kelimeleri Soruk kişi adına, Soruk Bey’e veya bölgedeki Soruk yer adına bağlamamaktadır.',
      label: 'Etimolojik karşılaştırma · düşük güven',
    },
    records: {
      kicker: 'Kanıt değerlendirmesi',
      heading: 'Neye varılabilir, neye varılamaz?',
      introduction: 'Her iddianın durumu, dayandığı kaynağın gösterebildiğiyle sınırlıdır.',
      items: [
        {
          index: '01',
          label: 'Yüksek güven · dilbilimsel yapı',
          title: 'Soruklu en doğal biçimde “Soruk’la bağlantılı” demektir.',
          description:
            'Türkçedeki -lu eki ilişki, mensubiyet veya yer kökeni bildirir; Soruk bağımsız olarak belgelenmiş bir yer adıdır. Bu biçimbilimsel okuma, belirli bir ailenin soy geçmişini tek başına göstermez.',
        },
        {
          index: '02',
          label: 'Yüksek güven · yayımlanmış tahrir araştırması',
          title: 'Soruk ad unsuru, Sorukderesi biçiminde en az 1485’e kadar belgelenmektedir.',
          description:
            'Mehmet Öz’ün yayımladığı tahrir tablosu Sorukderesi’ni 1485’te kayıtlı nüfusu bulunmayan bir mezraa, yaklaşık 1520’de 6 neferli bir mezraa ve 1576’da 55 neferli bir karye olarak gösterir.',
        },
        {
          index: '03',
          label: 'Destekli · asıl kayıt henüz görülmedi',
          title: '“Soruklu” biçimi, Soyadı Kanunu öncesi bir kişi bağlamında Amasya Tarihi’nde geçmektedir.',
          description:
            'Amasya Tarihi, H.1201/1786–87 bağlamındaki bir kişiyi “Soruklu Hâfız Ali Efendi” diye anar. Dayanak 18. yüzyıl görevlendirme kaydı henüz doğrudan incelenmemiştir.',
        },
        {
          index: '04',
          label: 'Daha sonraki tarih anlatısı · önemli ipucu',
          title: 'Soruk, Bahâeddîn Gökceğiz’in babası olarak gösterilir.',
          description:
            'Amasya Tarihi, “Gökceğiz Veled Soruk” ifadesini kullanır ve Bahâeddîn Gökceğiz’i Salur mensubu olarak H.575/1179–80 civarındaki olaylarla ilişkilendirir. Bu, eserin anlatısı içinde 12. yüzyılın sonlarıyla bağlantılı bir kişinin babasının Soruk adını taşıdığını destekler. Dayanak olan Orta Çağ belgesi henüz bağımsız olarak belirlenmemiştir.',
        },
        {
          index: '05',
          label: 'Aynı kaynak içinde metinsel destek',
          title: 'Gökceğiz’in babası Soruk Bey olarak tanımlanır.',
          description:
            'Aynı eser başka bir pasajda “Soruk Beyzâde Bahâeddîn Gökceğiz Bey” ifadesini kullanır ve H.575’ten sonra atabeg olarak görevlendirildiğini bildirir. Bu kullanım, “Gökceğiz Veled Soruk” ifadesindeki babanın yazar tarafından Soruk Bey olarak anlaşıldığını güçlendirir. Ancak bu bağımsız ikinci bir kaynak değildir.',
        },
        {
          index: '06',
          label: 'Ayrı adlandırma anlatısı · tarihsiz',
          title:
            'Karalı/Kanık bağlamındaki Soruk Bey, Soruk adlı yerleşimle ilişkilendirilir.',
          description:
            'Amasya Tarihi, Zeytun’daki Karalı topluluğu içinde Soruk Bey adlı bir kişiyi anar ve Soruk adlı yerleşimin adını ona bağlar. Pasaj tarih vermez ve bu kişiyi Gökceğiz’in babasıyla özdeşleştirmez.',
        },
        {
          index: '07',
          label: 'Yerel rivayet · bağımsız kanıt değil',
          title: '“1200’ler, Kınık Yörük beyi” ayrıntısı rivayet düzeyindedir.',
          description:
            'TEPGE raporu, Soruk adlı yerleşimin 1200’lerde geldiği söylenen bir Kınık Yörük beyiyle bağlantısını açıkça rivayet olarak aktarır. Bu anlatı bağımsız bir Orta Çağ belgesi değildir.',
        },
        {
          index: '08',
          label: 'Araştırma ipucu · kimlik çözülemedi',
          title: 'Tâceddin adlı tahrir emininin kimliği henüz çözülememiştir.',
          description:
            'Aynı dönem bağlamında Tâceddin adlı bir emin, Gedeğra zaimi Tâceddin Beğ, Göl gelirleriyle ilişkili bir Tâceddin Beğ, Tâcî Bey ve vakfiyeyle ilişkili bir İbrahim Paşa kaydı bulunmaktadır. İncelenen hiçbir kaynak bu kişilerin aynı kişi olduğunu veya herhangi birinin TT.d 37 tahririnden sorumlu emin olduğunu göstermemektedir.',
        },
        {
          index: '09',
          label: 'Etimolojik karşılaştırma · düşük güven',
          title: 'Soruk kelimesinin sözlük kökeni henüz çözülememiştir.',
          description:
            'Eski Türkçe sorug ve Osmanlı Türkçesi soruk için şan, şöhret, soru ve sorgu gibi farklı anlamlar verilmiştir. Ancak incelenen hiçbir etimolojik çalışma bu kelimeleri Soruk kişi adına, Soruk Bey’e veya bölgedeki Soruk yer adına bağlamamaktadır.',
        },
        {
          index: '10',
          label: 'Kanıtlanmadı · aile kayıtları gerekli',
          title: 'Modern Soruklu ailelerinin Soruk Bey’den doğrudan geldiği gösterilmemiştir.',
          description:
            'Kesintisiz soy için nüfus kayıtları, medeni kayıtlar, mezarlık belgeleri, tapu ve diğer aileye özgü belgeler ile en eski resmî soyadı kaydının birlikte incelenmesi gerekir. Yer adı, göç anlatısı ve tekrarlanan adlar tek başına soy bağı kurmaz.',
        },
      ],
    },
    account: {
      kicker: 'Daha sonraki tarih anlatıları',
      heading: 'Soruk Bey anlatıları',
      introduction:
        'Amasya Tarihi, farklı boy ve coğrafya bağlamlarında Soruk veya Soruk Bey adlı kişilerle ilgili iki ayrı anlatı aktarır. İncelenen pasajlar bu kişileri aynı kişi olarak tanımlamaz. Bu nedenle anlatılar, yeni bir kaynak aralarında açık bir bağlantı kurmadıkça ayrı değerlendirilmelidir.',
      items: [
        {
          title: 'Karalı, Kanık ve Zeytun anlatısı',
          body:
            'Zeytun’a ilişkin pasajda Amasya Tarihi, Kanık’a bağlı Esenli ve Karalı topluluklarından söz eder, Karalı içinde Soruk Bey adlı bir kişiyi anar ve Soruk adlı yerleşimin adını ona bağlar.',
          support:
            'Desteklediği: Daha sonraki bir tarih anlatısında, Karalı/Kanık bağlamındaki Soruk Bey ile Soruk adlı yerleşim arasında adlandırma bağlantısı kurulmuştur.',
          limitation:
            'Desteklemediği: Pasaj Soruk Bey için tarih vermez, çağdaş bir kaynak göstermez ve bu kişinin Bahâeddîn Gökceğiz’in babası olduğunu söylemez.',
          label: 'Tarihsiz, daha sonraki bir adlandırma anlatısı',
        },
        {
          title: '“Gökceğiz Veled Soruk”',
          body:
            'Eserin başka bir bölümünde “Gökceğiz Veled Soruk” ifadesi yer alır. Bu ifade “Soruk’un oğlu Gökceğiz” anlamına gelir. Aynı anlatı Bahâeddîn Gökceğiz’i Salur mensubu ve H.575/1179–80 civarındaki olaylarla ilişkili bir kişi olarak sunar.',
          support:
            'Desteklediği: Yazarın anlatısında, 12. yüzyılın sonlarıyla ilişkilendirilen Gökceğiz’in babasının adı Soruk’tur.',
          limitation:
            'Desteklemediği: Bu pasaj tek başına babaya “Bey” unvanı vermez, altında yatan Orta Çağ belgesini tanımlamaz ve onu Soruk adlı yerleşime bağlamaz.',
          label: 'Eski bir anlatıyı aktaran daha sonraki tarih kaydı',
        },
        {
          title: '“Soruk Beyzâde Bahâeddîn Gökceğiz Bey”',
          body:
            'Başka bir pasaj aynı kişiyi “Soruk Beyzâde Bahâeddîn Gökceğiz Bey” diye adlandırır ve H.575’ten sonra atabeg olarak görevlendirildiğini bildirir.',
          support:
            'Desteklediği: Eserin kendi içindeki kullanım, “Gökceğiz Veled Soruk” ifadesindeki babanın yazar tarafından Soruk Bey olarak anlaşıldığını destekler.',
          limitation:
            'Desteklemediği: Soruk Bey’in veya Gökceğiz’in biyografisini, görevini ve tarihini bağımsız olarak doğrulayan, açıkça tanımlanmış bir Orta Çağ belgesi henüz bulunmamıştır.',
          label: 'Aynı daha sonraki kaynak içindeki metinsel destek',
        },
      ],
      conclusion:
        'Gökceğiz pasajları, Amasya Tarihi içinde Soruk veya Soruk Bey adlı bir babaya ilişkin kendi içinde uyumlu bir anlatı oluşturur. Zeytun pasajı ise Karalı/Kanık bağlamında ayrı bir yer adı geleneğini korur. Karalı/Kanık Soruk Bey ile Salur mensubu Gökceğiz’in babası aynı kişi olabilir, ancak mevcut kaynaklar bunu göstermemektedir. İki anlatı arasında, Sorukderesi’yle veya günümüzdeki Soruklu aileleriyle kanıtlanmış bir bağ yoktur.',
    },
    taceddin: {
      heading: 'Tâceddin meselesi henüz çözülemedi',
      title: '1485 tahrir görevlisinin kimliği belirsizliğini koruyor.',
      body:
        'Mehmet Öz, 1485 tahririnin Tâceddin adlı bir emin tarafından yürütüldüğünü belirtir. Aynı Vezirköprü araştırmaları ayrıca Tâceddin Beğ adlı nüfuzlu bir Gedeğra zaimini kaydeder ve Tâceddin Beğ adlı bir kişinin Göl nahiyesinde iki karyenin divanî gelirine sahip olduğunu gösterir. 2014 tarihli Vezirköprü Araştırmaları cildindeki ayrı bir çalışma, Vezirköprü külliyesinin banisini 1495 tarihli Arapça vakfiyede Hacı Beyzâde Mevlânâ Safiyyüddin oğlu İbrahim Paşa olarak verir; vakfiye derkenarında ise “Tacüddin” biçiminin kullanıldığını aktarır. TDV ayrıca Tâcizâde Câfer Çelebi’nin babası Tâcî Bey hakkında kaynak-eleştirel biyografik bağlam sunar.',
      limitation:
        'İncelenen hiçbir kaynak tahrir emini Tâceddin’i, Gedeğra zaimi Tâceddin Beğ’i, Göl gelirleriyle ilişkili Tâceddin Beğ’i, Tâcî Bey’i veya vakfiyeyle ilişkili İbrahim Paşa’yı aynı kişi olarak açıkça tanımlamaz. Bunlardan hiçbiri TT.d 37 tahririnden sorumlu emin olarak doğrudan doğrulanmamıştır.',
      label: 'Araştırma ipucu · kimlikler kanıtlanmadı',
    },
    geography: {
      kicker: 'Yerler ve aile bağlamı',
      heading: 'Birbirinden ayrı iki Soruk yerleşimi',
      introduction:
        'Vezirköprü’deki eski Soruk, günümüzde Sarıdibek adıyla anılmaktadır. Aynı bölgesel bağlamda Sorukderesi adı 1485’ten itibaren yayımlanmış tahrir araştırmasında görünür. İncelenen kaynaklar, bu adların kesintisiz biçimde aynı idarî yerleşimi gösterip göstermediğini kesinleştirmemektedir. Osmancık’taki Yenidanişment/Soruk ise günümüzde ayrıca kaydedilen farklı bir yerleşim bağlamıdır; incelenen hiçbir kaynak iki yerin ortak kurucu nüfusa, göç tarihine veya soya sahip olduğunu göstermemektedir.',
      placeHeading: 'Yer veya bağlam',
      evidenceHeading: 'Belgelenen',
      readingHeading: 'Kanıtın izin verdiği yorum',
      rows: [
        {
          place: 'Vezirköprü · Soruk / Sorukderesi / Sarıdibek',
          evidence:
            'Mehmet Öz’ün yayımlanmış tahrir araştırması, Seyahatname, 1959 sınır dosyası, 1974 haberi ve “Soruk Vadisi” adının süren kullanımı.',
          reading:
            'Araştırmadaki en güçlü belgeli bölgesel Soruk yer adı bağlamıdır. Kanıtlar idarî yerleşimin, nüfusun veya soyun kesintisiz özdeşliğini kesinleştirmez.',
        },
        {
          place: 'Osmancık · Yenidanişment / Soruk',
          evidence:
            'Güncel bir Çorum İl Özel İdaresi raporu “OSMANCIK Yenidanişment/Soruk” kaydını ayrıca verir.',
          reading:
            'Osmancık’ta günümüzde ayrıca kaydedilen farklı bir Soruk yeridir. Kuruluşu ve nüfus tarihi ayrı araştırma konularıdır.',
        },
        {
          place: 'Osmancık · Tekmen, Karataş ve Saltık/Saltuk',
          evidence:
            'Serhat Soruklu bu yerleri baba tarafı aile bağlamı olarak tanımlar; kamuya açık kayıtlar da Soruklu adını Tekmen ve Karataş ile ilişkilendirir.',
          reading: 'Aileye özgü nüfus, mezarlık ve tapu araştırması için öncelikli bölgedir.',
        },
        {
          place: 'Osmancık–Vezirköprü–Bafra',
          evidence:
            '1959 dosyası Soruk’u Osmancık sınırına yerleştirir; yerel haber Osmancık yönüne hareketten söz eder ve daha geniş bölgedeki kamu kayıtlarında Soruklu görülür.',
          reading: 'Olası araştırma coğrafyası · soy bağlantısı kanıtlanmadı',
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
            'Servet Köroğlu’na atfedilen yerel anlatıya göre bugün yaklaşık 500 kişinin Soruklu soyadını taşıdığı tahmin edilmektedir.',
          boundary:
            'Yaklaşıktır; resmî bir ulusal sayı değildir; bağımsız olarak doğrulanmamıştır.',
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
      evidenceLabel:
        'Atfedilen yerel anlatı · yaklaşık · resmî ulusal sayı değil · bağımsız doğrulanmadı',
      attribution:
        'Bu yerel tahminler, Osmancık’ın Tekmen köyünde muhtarlık yapmış olan Servet Köroğlu tarafından aktarılmıştır. Osmancık Kaymakamlığının 31 Mart 2017 tarihli resmî kaydı, kendisini Tekmen Köyü muhtarı olarak tanımlamaktadır. Nüfus ve soyadı rakamları yerel tahmin niteliğindedir ve henüz eksiksiz bir resmî soyadı veya nüfus kaydıyla doğrulanmamıştır.',
    },
    unknown: {
      kicker: 'Kanıtlanmamış noktalar',
      heading: 'Kanıtın açık bir sınırı var.',
      introduction:
        'Bu sorular aileye özgü medeni ve arşiv kayıtları gerektirir; çıkarımla cevaplanamaz.',
      items: [
        'Gökceğiz’in babası olarak anlatılan Soruk Bey’in bağımsız bir Orta Çağ belgesiyle doğrulanmış biyografisi.',
        'Karalı/Kanık Soruk Bey’in güvenilir tarihi ve kimliği.',
        'Gökceğiz’in babası ile Karalı/Kanık Soruk Bey’in aynı kişi olup olmadığı.',
        'Her iki Soruk Bey anlatısının Sorukderesi ile belgelenmiş bağlantısı.',
        'Modern Soruklu ailelerinin bu kişilerden doğrudan geldiği.',
        'Tâceddin adlı tahrir emininin kimliği ve aynı dönemdeki Tâceddin veya İbrahim Paşa kayıtlarından herhangi birinin bu görevliye ait olup olmadığı.',
        'Belirli bir ailenin Soruklu soyadını ne zaman ve neden aldığı.',
        'Vezirköprü Soruk ile Osmancık Yenidanişment/Soruk arasında kanıtlanmış kuruluş veya soy bağlantısı.',
        'Arma, asalet, hanedan veya mirasla geçen yetki iddiaları.',
      ],
      boundary:
        'Soyadının desteklenebilir bir anlamı ve belgeli bölgesel geçmişi, ihtimali soy kütüğüne dönüştürmeden de anlamlıdır.',
    },
    researchStatus: {
      heading: 'Araştırma durumu',
      badge: 'Araştırma donduruldu · 7 Ağustos 2026',
      summary:
        'Bu sayfa 7 Ağustos 2026 itibarıyla kararlı sürüm olarak kabul edilmektedir. Bundan sonraki değişiklikler editoryal değil, yeni kanıta dayalı olmalıdır.',
      criteriaIntroduction:
        'Araştırma yalnızca maddi nitelikte yeni bir kanıt bulunduğunda yeniden açılmalıdır. Örneğin:',
      criteria: [
        'TT.d 37’nin Sorukderesi kaydını içeren asıl varağı veya başka bir birincil Osmanlı kaydı',
        'Soruk, Soruk Bey veya Bahâeddîn Gökceğiz hakkında bağımsız bir Orta Çağ kaynağı',
        'Sorukderesi, Soruk ve Sarıdibek arasında güvenilir biçimde bağlantı kuran yeni bir kaynak',
        'aileye özgü nüfus, medeni kayıt, mezarlık, tapu veya erken dönem soyadı kayıtları',
        '1485 tahririyle ilişkili Tâceddin’in kimliğini güvenilir biçimde çözen kanıt',
        'mevcut güven değerlendirmelerinden birini maddi olarak değiştiren yeni kanıt',
      ],
      boundary:
        'Küçük ifade tercihleri, aynı bilgiyi tekrarlayan ikincil kaynaklar veya yeni yerel rivayetler tek başına sayfanın yeniden açılması için yeterli olmamalıdır.',
      reviewLabel: 'Son esaslı inceleme',
      reviewDate: '7 Ağustos 2026',
      statusLabel: 'Durum',
      status: 'Yeni kanıt bulunana kadar donduruldu',
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
          sourceDetails: 'Türk Dil Kurumu · Hamza Zülfikar · 2025 baskısı',
          description: '-lı / -li / -lu / -lü eklerini ve yer bağlantılı örnekleri açıklar.',
          role: 'Dilbilimsel yapı',
          url: sourceUrls.suffix,
        },
        {
          number: '02',
          title: 'Tahrir Defterlerine Göre Vezirköprü Yöresinde İskân ve Nüfus (1485–1576)',
          sourceDetails:
            'Mehmet Öz · Belleten · Ağustos 1993 · c. 57 · sy. 219 · s. 509–538 · DOI 10.37879/belleten.1993.509 · Tablo 17 · basılı sayfa 536',
          description:
            'Sorukderesi’ni 1485’te kayıtlı nüfusu bulunmayan bir mezraa, yaklaşık 1520’de 6 neferli bir mezraa ve 1576’da 55 neferli bir karye olarak gösteren Tablo 17’yi yayımlar. Makale TT 37’nin 571–672. sayfalarını Vezirköprü bölümüne ayırır ve 1485 tahririnin Tâceddin adlı bir emin tarafından yürütüldüğünü belirtir.',
          role: 'Yayımlanmış tahrir araştırması',
          url: sourceUrls.registers,
        },
        {
          number: '03',
          title: 'Vezirköprü Araştırmaları',
          sourceDetails:
            'Ed. Cevdet Yılmaz · Vezirköprü Belediyesi Kültür Yayınları No. 2 · 21 Mart 2014 · ISBN 978-975-94391-1-8 · ilgili basılı sayfalar 18, 32, 34, 295–297, 468–470',
          description:
            'Mehmet Öz’ün tahrir makalesini bazı yer adı düzeltmeleriyle yeniden yayımlayan, “M = Mezraa (ekinlik)” açıklamasını veren, 1495 tarihli Taceddin İbrahim Paşa vakfiyesini kaynak-eleştirel biçimde inceleyen ve güncel bölgesel bağlamda “Sarıdibek (Soruk) havzası” ile “Soruk Vadisi” ifadelerini kullanan derleme araştırma cildidir. Öz makalesinin yeniden yayımı, Sorukderesi satırı için bağımsız ikinci kanıt değildir.',
          role: 'Derleme araştırma cildi · bağlamsal kanıt',
          url: sourceUrls.vezirkopruResearch,
        },
        {
          number: '04',
          title: 'Evliya Çelebi in Vezirköprü, 1648',
          sourceDetails: 'Cedrus IX · Tønnes Bekker-Nielsen · 2021',
          description: 'Súrúk adını aktarır ve güzergâhın birinci el güvenilirliğini inceler.',
          role: 'Seyahat metni geleneği',
          url: sourceUrls.evliya,
        },
        {
          number: '05',
          title: 'Amasya Tarihi, 1–4. ciltler, dijital sayfa 128',
          sourceDetails: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddin Yasar',
          description:
            '“Gökceğiz Veled Soruk” ifadesini kaydeder, Bahâeddîn Gökceğiz’i Salur ile ilişkilendirir ve onu H.575/1179–80 civarındaki olaylarla bağlantılı gösterir.',
          role: 'Daha sonraki tarih anlatısı',
          url: sourceUrls.gokcegiz,
        },
        {
          number: '06',
          title: 'Amasya Tarihi, 1–4. ciltler, dijital sayfa 170',
          sourceDetails: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddin Yasar',
          description: 'Soruklu Hâfız Ali Efendi’nin görevini, dönüşünü ve ölümünü kaydeder.',
          role: 'Daha sonraki tarih anlatısı',
          url: sourceUrls.sorukluHafizAli,
        },
        {
          number: '07',
          title: 'Amasya Tarihi, 1–4. ciltler, dijital sayfa 200',
          sourceDetails: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddin Yasar',
          description:
            'Soruk adlı yerleşimi Karalı/Kanık bağlamındaki Soruk Bey ile ilişkilendirir.',
          role: 'Tarihsiz, daha sonraki adlandırma anlatısı',
          url: sourceUrls.sorukBey,
        },
        {
          number: '08',
          title: 'Amasya Tarihi, 1–4. ciltler, dijital sayfa 338',
          sourceDetails: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddin Yasar',
          description:
            'Aynı kişiyi “Soruk Beyzâde Bahâeddîn Gökceğiz Bey” olarak adlandırır ve H.575’ten sonra atabeg olarak görevlendirildiğini bildirir.',
          role: 'Aynı daha sonraki kaynak içinde metinsel destek',
          url: sourceUrls.gokcegizAtabeg,
        },
        {
          number: '09',
          title: 'HÜSEYİN HÜSÂMEDDİN YASAR',
          sourceDetails: 'TDV İslâm Ansiklopedisi · Turgut Akpınar',
          description:
            'Hüseyin Hüsâmeddin’in yazmalar, mahkeme sicilleri, vakfiyeler, kitabeler ve mezar taşları gibi ilk kaynaklardan yararlandığını; ancak tek tek iddiaların dayandığı kaynakları çoğu zaman göstermemesi ve bazı aşırı etimolojik benzetmeleri sebebiyle ilmî çekinceler bulunduğunu açıklar.',
          role: 'Kaynak-eleştirel bağlam',
          url: sourceUrls.huseyinHusameddin,
        },
        {
          number: '10',
          title: 'TÂCÎZÂDE CÂFER ÇELEBİ',
          sourceDetails: 'TDV İslâm Ansiklopedisi · İsmail E. Erünsal',
          description:
            'Tâcî Bey hakkında Şehzade Bayezid’in defterdarı ve Amasya seraskeri olarak aktarılan biyografik bağlamı verir; yalnız Hüseyin Hüsâmeddin’e dayanan aile bilgilerini diğer biyografik kaynaklarla desteklenen bilgilerden ayırır. Tâcî Bey’i tahrir emini veya Vezirköprü vakfiyesinde adı geçen İbrahim Paşa olarak tanımlamaz.',
          role: 'Kaynak-eleştirel araştırma ipucu',
          url: sourceUrls.tacizadeCafer,
        },
        {
          number: '11',
          title: 'Kırsal Kalkınma Amaçlı Hibe Projelerinin Değerlendirilmesi: TR83 Bölgesi Örneği',
          sourceDetails: 'Tarım Bakanlığı araştırma yayını · TEPGE · yayın 270',
          description: '1200’ler, Kınık ve Yörük beyi ayrıntılarını yerel rivayet olarak kaydeder.',
          role: 'Yerel rivayet',
          url: sourceUrls.oralTradition,
        },
        {
          number: '12',
          title: 'Amasya İstiklal Mahkemesi, cilt 12/1',
          sourceDetails: 'Türkiye Büyük Millet Meclisi · yayımlanmış mahkeme kayıtları',
          description: 'Soruk köylülerini Soyadı Kanunu öncesi hane/sülale adlarıyla kaydeder.',
          role: 'Yayımlanmış mahkeme kayıtları',
          url: sourceUrls.earlyRepublic,
        },
        {
          number: '13',
          title: 'Cumhuriyet Arşivi Çorum Belgeleri Kataloğu',
          sourceDetails: 'Çorum Belediyesi kültür yayını · 2017 · sayfa 195–196',
          description:
            'Vezirköprü Soruk ve Osmancık Gökdere’ye ait 1959 sınır kayıtlarını kataloglar.',
          role: 'Arşiv kataloğu',
          url: sourceUrls.boundaryArchive,
        },
        {
          number: '14',
          title: 'Sarıdibek Köyünde 3000 Dönüm Arazi Çöl Haline Geldi',
          sourceDetails: 'Vezirköprü Vatandaş · 1974 haberi, 2024’te yeniden yayımlandı',
          description:
            'Sarıdibek’i eski adı Soruk ile tanımlar ve Osmancık yönüne hareketi aktarır.',
          role: 'Yerel haber',
          url: sourceUrls.localReport,
        },
        {
          number: '15',
          title: 'Çorum İl Özel İdaresi 2024 Yılı Faaliyet Raporu',
          sourceDetails: 'Resmî kamu idaresi raporu',
          description: 'Osmancık’taki Yenidanişment/Soruk kaydını ayrıca verir.',
          role: 'Güncel idarî süreklilik',
          url: sourceUrls.currentOsmancik,
        },
        {
          number: '16',
          title: 'Vezirköprü: Genel Bakış',
          sourceDetails: 'Vezirköprü Ticaret ve Sanayi Odası',
          description: 'Sarıdibek ile Tahtaköprü’yü Soruk Vadisi içinde tanımlar.',
          role: 'Güncel bölgesel bağlam',
          url: sourceUrls.sorukValley,
        },
        {
          number: '17',
          title: 'Tekmen ve Karataş için kamuya açık kayıt örneği',
          sourceDetails: 'Çorum Haber · yerel kamu duyurusu · 2023',
          description: 'Soruklu soyadını Tekmen ve Karataş ile ilişkilendiren bir kamu kaydıdır.',
          role: 'Bölgesel soyadı kullanımı',
          url: sourceUrls.tekmenPublic,
        },
        {
          number: '18',
          title: 'Bafra Belediyesi 2024 Yılı Faaliyet Raporu',
          sourceDetails: 'Bafra Belediyesi · resmî kamu raporu',
          description: 'Bafra’da Soruklu soyadının geçtiği resmî bir kamu kaydıdır.',
          role: 'Bölgesel soyadı kullanımı',
          url: sourceUrls.bafraPublic,
        },
        {
          number: '19',
          title:
            'Araştırmacı Yazar Salim Savcı ve Tekmen Köyü Muhtarı Servet Köroğlu Sayın Kaymakamımızı Ziyaret Etti',
          sourceDetails: 'Osmancık Kaymakamlığı · 31 Mart 2017',
          description:
            'Servet Köroğlu’nu Mart 2017’de Osmancık’a bağlı Tekmen Köyü muhtarı olarak resmen tanımlar ve yerel anlatının kişiye atfını destekler.',
          role: 'Yerel anlatı atfı',
          url: sourceUrls.servetKoroglu,
        },
        {
          number: '20',
          title: 'Suuci < Sugeci / (Bel) Yazıtı Ne Zaman Yazıldı?',
          sourceDetails:
            'Türk Dil Kurumu · Osman Fikri Sertkaya · 2000 · sayfa 307–312; ilgili sayfa 311',
          description:
            'Süci Yazıtı’ndaki “Küm surug(ı)m” biçimini aktarır ve cümleyi “şan” ile “şöhret” sözleriyle çevirir.',
          role: 'Etimolojik karşılaştırma',
          url: sourceUrls.suciSertkaya,
        },
        {
          number: '21',
          title: 'Eski Türk Yazıt ve El Yazmalarında İkilemeler',
          sourceDetails:
            'Journal of Old Turkic Studies · Erhan Aydın ve Ahmet Karaman · 2019 · sayfa 267',
          description:
            'Kü sorug ifadesini eş anlamlı ikilemeler arasında sınıflandırır ve “şan, şöhret” karşılığını verir.',
          role: 'Etimolojik karşılaştırma',
          url: sourceUrls.oldTurkicDoublets,
        },
        {
          number: '22',
          title: 'Kazakça Ağızlar Sözlüğü’nde Kayıtlı Bazı Eskicil Sözcükler Üzerine',
          sourceDetails:
            'Türk Dil Kurumu · Sherubay Kurmanbaiuly, Marlen Adilov ve Zhumagali İbragimov · 2022 · sayfa 181',
          description:
            'Süci’deki sorug için farklı olarak “sorular” karşılığını verir; soru, sorgu ve arama ile ilgili kullanımları kaydeder.',
          role: 'Etimolojik karşılaştırma',
          url: sourceUrls.archaicSoruk,
        },
        {
          number: '23',
          title: 'Kâmûs-ı Türkî: soruk',
          sourceDetails: 'Şemseddin Sami · dijital sözlük maddesi · sayfa 838',
          description:
            '838. sayfadaki tıpkıbasım maddeyi sunar ve Osmanlı Türkçesindeki soruk sözünü sual ve pürsiş karşılıklarıyla kaydeder.',
          role: 'Tarihî sözlük metnine doğrudan erişim · etimolojik karşılaştırma',
          url: sourceUrls.kamusSoruk,
        },
        {
          number: '24',
          title: 'Evliya Çelebi Seyahatnamesi, 2. cilt, basılı sayfa 402',
          sourceDetails:
            'İkdam Matbaası · 1896 · University of Toronto taraması, Internet Archive · kamu malı',
          description:
            'Osmanlı harfli basılı sayfada Göl’den Zeytun yönüne uzanan güzergâhta صوروق biçimi açıkça görülür.',
          role: 'Basılı seyahat metnine doğrudan erişim',
          url: sourceUrls.evliyaEdition,
        },
        {
          number: '25',
          title: 'Evliya Çelebi',
          sourceDetails: 'TDV İslâm Ansiklopedisi · Mücteba İlgürel',
          description:
            'Osmanlı seyyahı ve on ciltlik Seyahatname hakkındaki kısa tanıtımın biyografik temelini sağlar.',
          role: 'Kaynak-eleştirel bağlam',
          url: sourceUrls.evliyaBiography,
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
        'Soruklu, açık bir Türkçe yapıya, Osmanlı dönemine uzanan yer adı izine ve Soyadı Kanunu öncesi bağlamda aktarılan bir kişi tanımına sahiptir. Dayanak görevlendirme kaydı henüz doğrudan incelenmemiştir; aileye özgü hat, bulunmayı bekleyen kayıtlara açıktır.',
      homeAction: 'Serhat Soruklu’ya dön',
      orderAction: 'Soruklu Order’ı inceleyin',
      orderAriaLabel: 'Soruklu Order’ı inceleyin — ayrı ve gönüllü bir girişim',
    },
  },
} as const;

@Component({
  selector: 'app-soruklu-surname',
  imports: [NgOptimizedImage, PathIconComponent, RouterLink, TooltipDirective],
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
  readonly documentIcon = mdiBookOpenPageVariantOutline;
  readonly documentAssets = evliyaDocumentAssets;
  readonly dictionaryAssets = kamusDictionaryAssets;
  readonly photoAssets = saridibekPhotoAssets;
  readonly timelineIcons = [
    mdiBookOpenPageVariantOutline,
    mdiFileDocumentOutline,
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

  openEvliyaDocumentDialog(): void {
    void this.saridibekDialog.open(evliyaDocumentDialogData);
  }

  openKamusDictionaryDialog(): void {
    void this.saridibekDialog.open(kamusDictionaryDialogData);
  }

  private applyLanguageMetadata(): void {
    const content = this.content();

    this.document.documentElement.lang = content.htmlLang;
    this.seoService.applyLocalizedIdentityRuntimeMetadata('soruklu-surname', {
      title: content.seo.title,
      description: content.seo.description,
      inLanguage: content.htmlLang,
      locale: this.language() === 'tr' ? 'tr_TR' : 'en_GB',
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
