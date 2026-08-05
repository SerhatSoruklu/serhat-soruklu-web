import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { pageSeoMetadata } from '../../core/seo/seo.config';
import { SeoService } from '../../core/seo/seo.service';

type SurnameLanguage = 'en' | 'tr';

const languageStorageKey = 'serhatsoruklu-surname-language';
const sourceUrls = {
  suffix:
    'https://tdk.gov.tr/wp-content/uploads/2011/12/Terim-Sorunlari-ve-Terim-Yapma-Yollari-_2025_-WEB.pdf',
  registers: 'https://www.belleten.gov.tr/eng/full-text-pdf/2265/tur',
  localReport:
    'https://www.vezirkopruvatandas.com.tr/saridibek-koyunde-3000-donum-arazi-col-haline-geldi.html',
  historicalAccount:
    'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page200.html',
  oldWord: 'https://tdkbelleten.gov.tr/eng/full-text/1065/tur',
} as const;

const surnameContent = {
  en: {
    htmlLang: 'en-GB',
    seo: pageSeoMetadata.sorukluSurname,
    switchLabel: 'Türkçe oku',
    switchAriaLabel: 'Türkçe oku — read this page in Turkish',
    eyebrow: 'A name rooted in place',
    title: 'What does Soruklu mean?',
    lead: 'Soruklu is a distinctive Turkish surname whose structure can be read clearly and whose regional footprint can be followed through historical records.',
    introduction:
      'The strongest supportable interpretation connects the name with a place called Soruk: a person or family associated with, belonging to, or originating from Soruk.',
    formationLabel: 'The formation',
    formationAriaLabel: 'Soruk plus lu forms Soruklu',
    formationMeaning: 'Association, belonging, or origin',
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
      entries: [
        {
          date: 'c. 1520',
          label: 'Ottoman register study',
          title: 'Sorukderesi appears as a mezraa.',
          description:
            'A study of Ottoman tahrir registers lists Sorukderesi in the Göl district with six nefer. Here, nefer is a register unit for taxable males, not the total population.',
        },
        {
          date: '1576',
          label: 'Ottoman register study',
          title: 'Sorukderesi is recorded as a village.',
          description:
            'The same study lists the settlement as a karye, or village, with 55 nefer. This gives the Soruk place name a firm sixteenth-century documentary footprint.',
        },
        {
          date: '1974',
          label: 'Local reporting',
          title: 'Sarıdibek is identified by its former name, Soruk.',
          description:
            'A reproduced Vezirköprü newspaper report calls Sarıdibek by its former name, Soruk, and says that some residents moved towards Osmancık and larger cities. It does not identify a particular modern family line.',
        },
      ],
    },
    records: {
      kicker: 'What the records show',
      heading: 'Three conclusions can be stated with care.',
      introduction:
        'Each conclusion rests on a different kind of evidence, so the page keeps their weight separate.',
      items: [
        {
          index: '01',
          label: 'Documented linguistic meaning',
          title: 'The suffix expresses connection.',
          description:
            'Turkish morphology supports reading -lu as a marker of association, belonging, possession, or place-based origin.',
        },
        {
          index: '02',
          label: 'Documented place-name history',
          title: 'Soruk is not a recent invention.',
          description:
            'The Sorukderesi entry in sixteenth-century register research establishes that the place name was already in regional use.',
        },
        {
          index: '03',
          label: 'Local historical reporting',
          title: 'The former name remained locally intelligible.',
          description:
            'The 1974 report explicitly identifies Sarıdibek as the place formerly called Soruk and records migration by some residents.',
        },
      ],
    },
    account: {
      kicker: 'Historical account',
      heading: 'A named tradition, not proven ancestry.',
      paragraphs: [
        'In Amasya Tarihi, Hüseyin Hüsâmeddîn Yasar describes Soruk Bey as a prominent figure of the Karalı group within the Kanık community and associates Soruk villages with his name.',
        'That is a relevant historical account of how the place name was understood. It is not contemporary medieval evidence, and it does not prove that people carrying the Soruklu surname today descend directly from Soruk Bey.',
      ],
      wordLabel: 'A linguistic possibility',
      wordNote:
        'Linguistic literature also records older forms related to soruk with the sense of “question” or “inquiry”. No evidence establishes that word as the origin of Soruk Bey’s name, the settlement name, or the modern surname.',
    },
    unknown: {
      kicker: 'What remains unproven',
      heading: 'The evidence has a clear boundary.',
      introduction:
        'These questions require family-specific civil, property, military, cemetery, or archival records. They should not be resolved by inference alone.',
      items: [
        'Direct descent of any modern Soruklu family from Soruk Bey.',
        'A precise medieval foundation date for the settlement.',
        'The exact date and circumstances in which a particular family adopted Soruklu as a formal surname.',
        'A confirmed genealogical route from Soruk to Osmancık or elsewhere.',
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
          title: 'Sarıdibek Köyünde 3000 Dönüm Arazi Çöl Haline Geldi',
          authority: 'Vezirköprü Vatandaş · 1974 report reproduced in 2024',
          description:
            'Identifies Sarıdibek by the former name Soruk and reports migration by some residents towards Osmancık and larger cities.',
          url: sourceUrls.localReport,
        },
        {
          number: '04',
          title: 'Amasya Tarihi, volumes 1–4, page 200',
          authority: 'Amasya Municipality digital edition · Hüseyin Hüsâmeddîn Yasar',
          description:
            'Presents the later historical account connecting Soruk villages with Soruk Bey of the Karalı group.',
          url: sourceUrls.historicalAccount,
        },
        {
          number: '05',
          title: 'Kazakça Ağızlar Sözlüğü’nde Kayıtlı Bazı Eskicil Sözcükler Üzerine',
          authority: 'Türk Dili Araştırmaları Yıllığı – Belleten · 2022',
          description:
            'Provides linguistic context for older forms related to question or inquiry without establishing the surname’s etymology.',
          url: sourceUrls.oldWord,
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
        'Soruklu carries a clear Turkish structure and a documented connection with an old regional place name. Its deeper family story remains open to records still to be found.',
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
        'Soruklu soyadının Soruk + -lu yapısını, yer bağlantısını, tarihî kayıtlarını ve soy iddialarına ilişkin kanıt sınırlarını inceleyin.',
    },
    switchLabel: 'Read in English',
    switchAriaLabel: 'Read in English — read this page in English',
    eyebrow: 'Kökeni bir yere dayanan ad',
    title: 'Soruklu ne anlama geliyor?',
    lead: 'Soruklu, yapısı açıkça okunabilen ve bölgesel izleri tarihî kayıtlarda takip edilebilen ayırt edici bir Türk soyadıdır.',
    introduction:
      'Kanıtlarla en güçlü biçimde desteklenebilen yorum, adı Soruk adlı yerle ilişkilendirir: Soruk’tan olan, Soruk’a mensup ya da Soruk kökenli kişi veya aile.',
    formationLabel: 'Adın yapısı',
    formationAriaLabel: 'Soruk ve lu eki Soruklu adını oluşturur',
    formationMeaning: 'Bağlantı, mensubiyet veya köken',
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
      entries: [
        {
          date: 'Yaklaşık 1520',
          label: 'Osmanlı tahrir araştırması',
          title: 'Sorukderesi bir mezraa olarak geçiyor.',
          description:
            'Osmanlı tahrir defterlerini inceleyen bir çalışma, Göl nahiyesindeki Sorukderesi’ni altı neferle kaydeder. Buradaki nefer, toplam nüfus değil, vergiye tabi erkekler için kullanılan kayıt birimidir.',
        },
        {
          date: '1576',
          label: 'Osmanlı tahrir araştırması',
          title: 'Sorukderesi bir köy olarak kaydediliyor.',
          description:
            'Aynı çalışma yerleşimi 55 neferli bir karye, yani köy olarak gösterir. Böylece Soruk yer adının 16. yüzyılda belgeli olduğu anlaşılır.',
        },
        {
          date: '1974',
          label: 'Yerel haber',
          title: 'Sarıdibek, eski adı Soruk olarak tanımlanıyor.',
          description:
            'Yeniden yayımlanan bir Vezirköprü gazete haberi, Sarıdibek’i eski adı Soruk ile anıyor ve bazı sakinlerin Osmancık’a ve büyük şehirlere göç ettiğini aktarıyor. Haber belirli bir modern aile hattını tanımlamıyor.',
        },
      ],
    },
    records: {
      kicker: 'Kayıtların gösterdiği',
      heading: 'Üç sonuç dikkatle ifade edilebilir.',
      introduction:
        'Her sonuç farklı bir kanıt türüne dayandığı için sayfa bunların ağırlığını birbirinden ayırır.',
      items: [
        {
          index: '01',
          label: 'Belgeli dilbilimsel anlam',
          title: 'Ek, bağlantı bildirir.',
          description:
            'Türkçe biçim bilgisi -lu ekinin ilişki, mensubiyet, sahiplik veya yer kökeni bildiren biçimde okunmasını destekler.',
        },
        {
          index: '02',
          label: 'Belgeli yer adı geçmişi',
          title: 'Soruk yakın zamanda üretilmiş bir ad değildir.',
          description:
            '16. yüzyıl tahrir araştırmasındaki Sorukderesi kaydı, yer adının o tarihte bölgede kullanıldığını ortaya koyar.',
        },
        {
          index: '03',
          label: 'Yerel tarih haberi',
          title: 'Eski ad yerel hafızada anlaşılır kalmıştır.',
          description:
            '1974 tarihli haber, Sarıdibek’i açıkça eski adı Soruk ile tanımlar ve bazı sakinlerin göçünü kaydeder.',
        },
      ],
    },
    account: {
      kicker: 'Tarihî anlatı',
      heading: 'Adlandırılmış bir gelenek; kanıtlanmış soy bağı değil.',
      paragraphs: [
        'Hüseyin Hüsâmeddîn Yasar, Amasya Tarihi’nde Soruk Bey’i Kanık topluluğu içindeki Karalı oymağının tanınmış bir kişisi olarak anlatır ve Soruk köylerini onun adıyla ilişkilendirir.',
        'Bu, yer adının nasıl anlaşıldığına dair dikkate değer bir tarihî anlatıdır. Döneme ait çağdaş bir Orta Çağ belgesi değildir ve bugün Soruklu soyadını taşıyanların doğrudan Soruk Bey’den geldiğini kanıtlamaz.',
      ],
      wordLabel: 'Dilbilimsel bir ihtimal',
      wordNote:
        'Dilbilim kaynaklarında soruk ile ilişkili eski biçimler “soru” veya “sorgu” anlamlarıyla da kaydedilir. Bu kelimenin Soruk Bey’in adının, yerleşim adının veya modern soyadının kökeni olduğunu gösteren bir kanıt bulunmuyor.',
    },
    unknown: {
      kicker: 'Kanıtlanmamış noktalar',
      heading: 'Kanıtın açık bir sınırı var.',
      introduction:
        'Bu sorular aileye özgü nüfus, tapu, askerlik, mezarlık veya arşiv kayıtları gerektirir. Yalnızca çıkarımla cevaplanmamalıdır.',
      items: [
        'Günümüzdeki herhangi bir Soruklu ailesinin Soruk Bey’den doğrudan geldiği.',
        'Yerleşimin kesin bir Orta Çağ kuruluş tarihi.',
        'Belirli bir ailenin Soruklu adını resmî soyadı olarak aldığı kesin tarih ve koşullar.',
        'Soruk’tan Osmancık’a veya başka bir yere uzanan doğrulanmış bir soy güzergâhı.',
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
          title: 'Sarıdibek Köyünde 3000 Dönüm Arazi Çöl Haline Geldi',
          authority: 'Vezirköprü Vatandaş · 1974 haberi, 2024’te yeniden yayımlandı',
          description:
            'Sarıdibek’i eski adı Soruk ile tanımlar ve bazı sakinlerin Osmancık ile büyük şehirlere göçünü aktarır.',
          url: sourceUrls.localReport,
        },
        {
          number: '04',
          title: 'Amasya Tarihi, 1–4. ciltler, sayfa 200',
          authority: 'Amasya Belediyesi dijital baskısı · Hüseyin Hüsâmeddîn Yasar',
          description:
            'Soruk köylerini Karalı oymağından Soruk Bey ile ilişkilendiren sonraki dönem tarihî anlatıyı sunar.',
          url: sourceUrls.historicalAccount,
        },
        {
          number: '05',
          title: 'Kazakça Ağızlar Sözlüğü’nde Kayıtlı Bazı Eskicil Sözcükler Üzerine',
          authority: 'Türk Dili Araştırmaları Yıllığı – Belleten · 2022',
          description:
            'Soyadının kökenini kesinleştirmeden, soru veya sorguyla ilişkili eski biçimlere dair dilbilimsel bağlam sağlar.',
          url: sourceUrls.oldWord,
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
        'Soruklu, açık bir Türkçe yapıya ve eski bir bölgesel yer adıyla belgeli bağlantıya sahiptir. Daha derin aile hikâyesi, bulunmayı bekleyen kayıtlara açıktır.',
      homeAction: 'Serhat Soruklu’ya dön',
      orderAction: 'Soruklu Order’ı inceleyin',
      orderAriaLabel: 'Soruklu Order’ı inceleyin — ayrı ve gönüllü bir girişim',
    },
  },
} as const;

@Component({
  selector: 'app-soruklu-surname',
  imports: [RouterLink],
  templateUrl: './soruklu-surname.component.html',
  styleUrl: './soruklu-surname.component.css',
})
export class SorukluSurnameComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly seoService = inject(SeoService);

  readonly language = signal<SurnameLanguage>('en');
  readonly content = computed(() => surnameContent[this.language()]);

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
