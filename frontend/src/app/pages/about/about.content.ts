export type AboutLanguage = 'en' | 'tr';

interface LocalizedValue<English, Turkish> {
  readonly __localized: true;
  readonly en: English;
  readonly tr: Turkish;
}

type ResolvedLocalized<Value, Language extends AboutLanguage> =
  Value extends LocalizedValue<infer English, infer Turkish>
    ? Language extends 'en'
      ? English
      : Turkish
    : Value extends readonly unknown[]
      ? { readonly [Index in keyof Value]: ResolvedLocalized<Value[Index], Language> }
      : Value extends object
        ? { readonly [Key in keyof Value]: ResolvedLocalized<Value[Key], Language> }
        : Value;

function localized<const English, const Turkish>(
  en: English,
  tr: Turkish,
): LocalizedValue<English, Turkish> {
  return { __localized: true, en, tr };
}

function isLocalizedValue(value: unknown): value is LocalizedValue<unknown, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__localized' in value &&
    value.__localized === true
  );
}

function resolveLocalized<Value, Language extends AboutLanguage>(
  value: Value,
  language: Language,
): ResolvedLocalized<Value, Language> {
  if (isLocalizedValue(value)) {
    return value[language] as ResolvedLocalized<Value, Language>;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveLocalized(item, language)) as ResolvedLocalized<
      Value,
      Language
    >;
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveLocalized(item, language)]),
    ) as ResolvedLocalized<Value, Language>;
  }

  return value as ResolvedLocalized<Value, Language>;
}

const aboutSchema = {
  htmlLang: localized('en-GB', 'tr-TR'),
  seo: {
    title: localized(
      'About Serhat Soruklu | Founder & CEO of Coupyn',
      "Serhat Soruklu Hakkında | Coupyn Kurucusu ve CEO'su",
    ),
    description: localized(
      'Serhat Soruklu is a London-based software developer and founder of Coupyn. Read his journey from Osmancık and Tottenham to production-scale systems.',
      "Osmancık'ta doğup Tottenham'da büyüyen Serhat Soruklu'nun kendi kendine öğrendiği yazılım yolculuğunu ve Coupyn'i nasıl kurduğunu okuyun.",
    ),
  },
  switchLabel: localized('Türkçe oku', 'Read in English'),
  switchAriaLabel: localized(
    'Türkçe oku — read this page in Turkish',
    'Read in English — bu sayfayı İngilizce okuyun',
  ),
  hero: {
    eyebrow: localized('ABOUT / IDENTITY RECORD', 'HAKKINDA / KİMLİK KAYDI'),
    title: 'Serhat Soruklu',
    role: localized(
      'Founder & CEO of Coupyn · Systems Architect · Solo Full-Stack Developer',
      "Coupyn Kurucusu ve CEO'su · Sistem Mimarı · Tek Başına Full-Stack Geliştirici",
    ),
    lead: localized(
      'Serhat Soruklu is a London-based software developer and founder of Coupyn. Born in Osmancık and raised in Tottenham, he built his route into technology through a shared family computer, private game servers and years of self-directed engineering.',
      "Serhat Soruklu, Londra'da yaşayan bir yazılım geliştirici ve Coupyn'in kurucusudur. Osmancık'ta doğup Tottenham'da büyüyen Serhat, teknolojiye giden yolunu ailece kullanılan bir bilgisayar, özel oyun sunucuları ve yıllar süren kendi kendine öğrenme süreciyle kurdu.",
    ),
    supporting: localized(
      'What began with RuneScape, Habbo and broken machines developed into production platforms, self-managed infrastructure and a public body of work focused on systems that remain understandable under pressure.',
      'RuneScape, Habbo ve bozulan makinelerle başlayan merak; zamanla üretimde çalışan platformlara, kendi yönettiği altyapıya ve baskı altında anlaşılır kalabilen sistemlere odaklanan açık bir çalışma geçmişine dönüştü.',
    ),
    facts: [
      {
        label: localized('Born', 'Doğum'),
        value: localized('22 February 1996', '22 Şubat 1996'),
      },
      {
        label: localized('Birthplace', 'Doğum yeri'),
        value: localized('Osmancık, Çorum, Turkey', 'Osmancık, Çorum, Türkiye'),
      },
      {
        label: localized('Raised in', 'Büyüdüğü yer'),
        value: localized('Tottenham, London', 'Tottenham, Londra'),
      },
      {
        label: localized('Primary work', 'Ana çalışma'),
        value: 'Coupyn',
      },
    ],
    portraitAction: localized('Open portrait and profile', 'Portreyi ve profili aç'),
    portraitAlt: localized(
      'Portrait of Serhat Soruklu, founder and CEO of Coupyn.',
      "Coupyn kurucusu ve CEO'su Serhat Soruklu'nun portresi.",
    ),
    routeLabel: 'Osmancık · Tottenham · Coupyn',
    factsLabel: localized('Profile facts', 'Profil bilgileri'),
  },
  chapters: {
    label: localized('Biography chapters', 'Biyografi bölümleri'),
    eyebrow: localized('CHAPTER INDEX', 'BÖLÜM DİZİNİ'),
    items: [
      {
        number: '01',
        label: localized('Origins', 'Kökenler'),
        id: 'origins',
      },
      {
        number: '02',
        label: localized('First computer', 'İlk bilgisayar'),
        id: 'first-computer',
      },
      {
        number: '03',
        label: localized('Education', 'Eğitim'),
        id: 'education',
      },
      {
        number: '04',
        label: localized('Private servers', 'Özel sunucular'),
        id: 'private-servers',
      },
      {
        number: '05',
        label: 'Coupyn',
        id: 'coupyn',
      },
      {
        number: '06',
        label: localized('Systems', 'Sistemler'),
        id: 'systems',
      },
      {
        number: '07',
        label: localized('Principles', 'İlkeler'),
        id: 'principles',
      },
      {
        number: '08',
        label: localized('Public identity', 'Açık kimlik'),
        id: 'public-identity',
      },
    ],
  },
  history: [
    {
      id: 'origins',
      kicker: localized('01 / ORIGINS', '01 / KÖKENLER'),
      heading: localized('Between Osmancık and Tottenham', 'Osmancık ile Tottenham arasında'),
      paragraphs: localized(
        [
          'Serhat Soruklu was born on 22 February 1996 in Osmancık, Çorum. He moved to London at the age of two and grew up in Tottenham.',
          'He was raised by his father, Galip, alongside his brother, Levent. Money was often tight, but the household still made room for simple things: PlayStation consoles, games and eventually a shared computer.',
          'Most summers were spent back in Osmancık. Those visits preserved a direct connection to his birthplace, extended family, village life and a world very different from North London.',
          'Tottenham had difficult and sometimes harsh sides. Serhat tried to stay away from the trouble around him and increasingly directed his attention toward computers, games and understanding how systems worked.',
        ],
        [
          "Serhat Soruklu, 22 Şubat 1996'da Çorum'un Osmancık ilçesinde doğdu. İki yaşındayken Londra'ya taşındı ve çocukluğunu Tottenham'da geçirdi.",
          "Babası Galip'in yanında, kardeşi Levent ile birlikte büyüdü. Para çoğu zaman sınırlıydı; buna rağmen evde PlayStation konsolları, oyunlar ve zamanla ortak kullanılan bir bilgisayar gibi sade imkânlara yer açıldı.",
          "Yaz tatillerinin çoğunu Osmancık'ta geçirdi. Bu ziyaretler, doğduğu yere, geniş ailesine, köy hayatına ve Kuzey Londra'dan çok farklı bir dünyaya doğrudan bağını korudu.",
          "Tottenham'ın zor ve zaman zaman sert tarafları vardı. Serhat çevresindeki sorunlardan uzak durmaya çalıştı ve dikkatini giderek bilgisayarlara, oyunlara ve sistemlerin nasıl çalıştığını anlamaya yöneltti.",
        ],
      ),
      calloutLabel: null,
      calloutMetric: null,
      callout: null,
    },
    {
      id: 'first-computer',
      kicker: localized('02 / FIRST COMPUTER', '02 / İLK BİLGİSAYAR'),
      heading: localized(
        'The computer stopped being only a game machine',
        'Bilgisayar yalnızca oyun makinesi olmaktan çıktı',
      ),
      paragraphs: localized(
        [
          "In 2004, his father brought home the family's first computer. Serhat shared it with Levent, and RuneScape became one of the first digital worlds they explored together.",
          'By the age of ten or eleven, Serhat had experimented with running a RuneScape private server and had learned how to reinstall operating systems. The machine was no longer only something to play on. It was something that could be opened, configured, broken and rebuilt.',
          'School-issued laptops in 2007 expanded that curiosity into operating systems, networking, remote administration and the relationship between software running on different machines.',
          'Around 2011, he bought his first personal computer through eBay. One brief attempt at Bitcoin mining lasted about a day: it made the computer too slow for World of Warcraft, so he stopped it and returned to the game.',
        ],
        [
          "Babası 2004'te ailenin ilk bilgisayarını eve getirdi. Serhat bu bilgisayarı Levent ile paylaştı ve RuneScape birlikte keşfettikleri ilk büyük dijital dünyalardan biri oldu.",
          'On ya da on bir yaşına geldiğinde kendi RuneScape özel sunucusunu çalıştırmayı denemiş ve işletim sistemlerini yeniden yüklemeyi öğrenmişti. Bilgisayar artık yalnızca oyun oynanan bir cihaz değildi. Açılabilen, ayarlanabilen, bozulabilen ve yeniden kurulabilen bir sistemdi.',
          "2007'de okulun verdiği dizüstü bilgisayarlar; işletim sistemleri, ağlar, uzaktan yönetim ve farklı makinelerde çalışan yazılımların ilişkisi üzerine merakını daha da genişletti.",
          "Yaklaşık 2011'de eBay üzerinden ilk kişisel bilgisayarını aldı. Bitcoin madenciliğini kısa süreliğine, yaklaşık bir gün denedi. Bilgisayarı World of Warcraft için fazla yavaşlatınca işlemi kapattı ve oyuna geri döndü.",
        ],
      ),
      calloutLabel: localized('THE ONE-DAY BITCOIN EXPERIMENT', 'BİR GÜNLÜK BITCOIN DENEYİ'),
      calloutMetric: localized('≈ 1 DAY', '≈ 1 GÜN'),
      callout: null,
    },
    {
      id: 'education',
      kicker: localized('03 / EDUCATION', '03 / EĞİTİM'),
      heading: localized('A route outside the standard route', 'Standart yolun dışında bir eğitim'),
      paragraphs: localized(
        [
          'Serhat began nursery and reception in London, attended Lancasterian Primary School and started Northumberland Park Community School in 2007. He later attended Haringey Sixth Form Centre, now Haringey Sixth Form College.',
          'His GCSE results were not strong. He later completed a BTEC qualification, but the technical education that shaped his career happened largely outside formal assessment.',
          'Forums, documentation, source code, configuration files and error messages became the practical curriculum. Progress came through repetition: testing an idea, finding the failure, understanding the layer beneath it and trying again.',
        ],
        [
          "Serhat, Londra'da anaokulu ve reception eğitimine başladı; Lancasterian Primary School'a devam etti ve 2007'de Northumberland Park Community School'a geçti. Daha sonra, bugün Haringey Sixth Form College adıyla devam eden Haringey Sixth Form Centre'a katıldı.",
          'GCSE sonuçları güçlü değildi. Daha sonra bir BTEC yeterliliğini tamamladı; ancak mesleğini şekillendiren teknik eğitimin büyük bölümü resmî sınavların dışında gerçekleşti.',
          'Forumlar, belgeler, kaynak kodu, yapılandırma dosyaları ve hata mesajları uygulamalı müfredatına dönüştü. İlerleme tekrar yoluyla geldi: bir fikri denemek, hatayı bulmak, altındaki katmanı anlamak ve yeniden denemek.',
        ],
      ),
      calloutLabel: null,
      calloutMetric: null,
      callout: localized(
        'The academic route was uneven. The learning did not stop.',
        'Akademik yol düzensizdi. Öğrenme durmadı.',
      ),
    },
    {
      id: 'private-servers',
      kicker: localized('04 / PRACTICAL APPRENTICESHIP', '04 / UYGULAMALI ÇIRAKLIK'),
      heading: localized(
        'Private servers became a practical education',
        'Özel sunucular uygulamalı bir okula dönüştü',
      ),
      paragraphs: localized(
        [
          'RuneScape and later Habbo retro communities became an informal technical apprenticeship. A working server required more than one skill: a website, database, emulator, client assets, networking, hosting and user data all had to agree.',
          'Public DevBest activity from around 2016 shows practical work with PHP, MySQL, Habbo content-management systems, emulators, game data, WebSockets and hosting problems.',
          'The public trail of his web-development work reaches back roughly a decade, while his experience with computers and private servers began much earlier. It was not formal employment. It was repeated hands-on exposure to complete systems.',
        ],
        [
          'RuneScape ve daha sonra Habbo retro toplulukları, gayriresmî bir teknik çıraklığa dönüştü. Çalışan bir sunucu tek bir beceriden fazlasını gerektiriyordu: web sitesi, veritabanı, emülatör, istemci dosyaları, ağ, barındırma ve kullanıcı verilerinin birlikte uyumlu çalışması gerekiyordu.',
          "Yaklaşık 2016'dan itibaren görülebilen DevBest paylaşımları; PHP, MySQL, Habbo içerik yönetim sistemleri, emülatörler, oyun verileri, WebSocket'ler ve barındırma sorunlarıyla yürütülen uygulamalı çalışmaları gösterir.",
          'Web geliştirme çalışmalarının açık izi yaklaşık on yıl geriye giderken, bilgisayarlar ve özel sunucularla deneyimi çok daha erken başladı. Bu resmî bir iş değildi. Tam sistemlerle tekrar tekrar temas ederek öğrenilen uygulamalı bir süreçti.',
        ],
      ),
      calloutLabel: null,
      calloutMetric: null,
      callout: localized(
        'The lesson was simple: the visible page is only the top layer.',
        'Ders basitti: görünen sayfa yalnızca en üst katmandır.',
      ),
    },
  ],
  coupyn: {
    kicker: '05 / COUPYN',
    heading: localized(
      'From experiments to a production platform',
      'Deneylerden üretimde çalışan bir platforma',
    ),
    paragraphs: localized(
      [
        'Serhat began building Coupyn in 2023 as a public coupon, referral and affiliate intelligence platform. Coupyn Ltd was incorporated in the United Kingdom in 2026.',
        'He designed, built and operates the platform independently. His responsibilities include the Angular frontend, Node.js and Express backend, MongoDB data layer, authentication, technical SEO, deployment, security, monitoring, recovery and self-managed infrastructure.',
        'By 2026, Coupyn contained roughly one million company pages. At that scale, architecture stops being abstract. Crawling, indexing, caching, database behaviour, failure recovery and operational cost become daily product concerns.',
        'Coupyn is the clearest expression of the route that began with private servers: understand the complete system, keep ownership visible and learn from the failures that only appear in production.',
      ],
      [
        "Serhat, Coupyn'i 2023'te herkese açık bir kupon, referans ve satış ortaklığı istihbarat platformu olarak geliştirmeye başladı. Coupyn Ltd, 2026'da Birleşik Krallık'ta kuruldu.",
        "Platformu bağımsız olarak tasarladı, geliştirdi ve işletiyor. Sorumlulukları Angular arayüzünü, Node.js ve Express backend'ini, MongoDB veri katmanını, kimlik doğrulamayı, teknik SEO'yu, dağıtımı, güvenliği, izlemeyi, kurtarmayı ve kendi yönettiği altyapıyı kapsıyor.",
        'Coupyn, 2026 itibarıyla yaklaşık bir milyon şirket sayfasına ulaştı. Bu ölçekte mimari soyut bir konu olmaktan çıkar. Tarama, indeksleme, önbellekleme, veritabanı davranışı, hata sonrası kurtarma ve işletme maliyeti günlük ürün meselelerine dönüşür.',
        'Coupyn, özel sunucularla başlayan yolun en açık ifadesidir: bütün sistemi anlamak, sahipliği görünür tutmak ve yalnızca üretimde ortaya çıkan hatalardan öğrenmek.',
      ],
    ),
    internalAction: localized('Explore the Coupyn system', 'Coupyn sistemini incele'),
    externalAction: localized('Open Coupyn', "Coupyn'i aç"),
    externalAriaLabel: localized('Open Coupyn in a new tab', "Coupyn'i yeni sekmede aç"),
    scaleLabel: localized('Production scale / 2026', 'Üretim ölçeği / 2026'),
    scaleAriaLabel: localized('Coupyn production scale in 2026', "Coupyn'in 2026 üretim ölçeği"),
    scaleValue: '≈ 1M',
    scaleDetail: localized('company pages', 'şirket sayfası'),
  },
  systems: {
    kicker: localized('06 / SELECTED SYSTEMS', '06 / SEÇİLMİŞ SİSTEMLER'),
    heading: localized(
      'The same principles moved into public systems',
      'Aynı ilkeler açık sistemlere taşındı',
    ),
    introduction: localized(
      'Beyond Coupyn, Serhat publishes systems and experiments concerned with deterministic behaviour, explicit boundaries, continuity and inspectable failure.',
      "Serhat, Coupyn'in dışında deterministik davranış, açık sınırlar, süreklilik ve incelenebilir hata durumları üzerine sistemler ve deneyler yayımlıyor.",
    ),
    openAction: localized('Explore system', 'Sistemi incele'),
    externalAction: localized('Open repository', 'Depoyu aç'),
    externalAriaLabel: localized(
      'Open repository — ZeroGlare Continuity System on GitHub, opens in a new tab',
      'Depoyu aç — GitHub üzerindeki ZeroGlare Continuity System deposu yeni sekmede açılır',
    ),
    cards: [
      {
        index: '01',
        title: 'ChatPDM',
        description: localized(
          'A deterministic concept system that resolves authored, versioned meanings and refuses unsupported composition rather than guessing.',
          'Yazılmış ve sürümlenmiş anlamları deterministik biçimde çözen; desteklenmeyen birleşimleri tahmin etmek yerine reddeden bir kavram sistemi.',
        ),
        path: '/systems/chatpdm',
        externalUrl: null,
      },
      {
        index: '02',
        title: 'Deterministic Boundary Firewall',
        description: localized(
          'A bounded pre-egress firewall experiment for inspecting requests before model or tool execution.',
          'İstekleri model veya araç çalıştırılmadan önce inceleyen sınırlı bir pre-egress güvenlik duvarı deneyi.',
        ),
        path: '/systems/deterministic-boundary-firewall',
        externalUrl: null,
      },
      {
        index: '03',
        title: 'Continuity Identity Model',
        description: localized(
          'A protocol workspace exploring whether identity, authority and responsibility remain valid when a machine actor changes state.',
          'Bir makine aktörü durum değiştirdiğinde kimlik, yetki ve sorumluluğun geçerli kalıp kalmadığını inceleyen bir protokol çalışma alanı.',
        ),
        path: '/systems/continuity-identity-model',
        externalUrl: null,
      },
      {
        index: '04',
        title: 'ZeroGlare Continuity System',
        description: localized(
          'A browser-native concept and visualisation laboratory used to explore continuity, scale and interface ideas.',
          'Süreklilik, ölçek ve arayüz fikirlerini araştırmak için kullanılan tarayıcı tabanlı bir kavram ve görselleştirme laboratuvarı.',
        ),
        path: null,
        externalUrl: 'https://github.com/SerhatSoruklu/zeroglare-continuity-system',
      },
    ],
  },
  principles: {
    kicker: localized('07 / OPERATING PRINCIPLES', '07 / ÇALIŞMA İLKELERİ'),
    heading: localized('Understand the layer you depend on', 'Bağımlı olduğun katmanı anla'),
    cards: [
      {
        index: '01',
        title: localized('Own the complete path', 'Bütün yolu sahiplen'),
        description: localized(
          'A frontend decision can become a database, infrastructure, SEO or recovery problem. The layers are connected.',
          'Bir frontend kararı veritabanı, altyapı, SEO veya kurtarma sorununa dönüşebilir. Katmanlar birbirine bağlıdır.',
        ),
      },
      {
        index: '02',
        title: localized('Make boundaries explicit', 'Sınırları açık yaz'),
        description: localized(
          'Systems are easier to trust when supported behaviour, failure states and authority are written down rather than implied.',
          'Desteklenen davranışlar, hata durumları ve yetki ima edilmek yerine yazıldığında sistemlere güvenmek kolaylaşır.',
        ),
      },
      {
        index: '03',
        title: localized('Prefer evidence over claims', 'İddia yerine kanıt üret'),
        description: localized(
          'Logs, tests, source code, reproducible behaviour and operational history matter more than impressive wording.',
          'Loglar, testler, kaynak kodu, tekrarlanabilir davranış ve işletme geçmişi etkileyici ifadelerden daha değerlidir.',
        ),
      },
      {
        index: '04',
        title: localized('Build for maintenance and recovery', 'Bakım ve kurtarmayı baştan düşün'),
        description: localized(
          'The system must still be understandable when something fails, when time is limited and when one person has to restore it.',
          'Bir şey bozulduğunda, zaman sınırlı olduğunda ve sistemi tek bir kişi geri getirmek zorunda kaldığında bile yapı anlaşılır kalmalıdır.',
        ),
      },
    ],
  },
  publicIdentity: {
    kicker: localized('08 / PUBLIC IDENTITY', '08 / AÇIK KİMLİK'),
    heading: localized(
      'One identity across the public web',
      'İnternette tek ve tutarlı bir kimlik',
    ),
    introduction: localized(
      "These profiles connect Serhat's code, writing, professional record and persistent research identity. They should be presented as public references, not as awards or independent endorsements.",
      "Bu profiller Serhat'ın kodlarını, yazılarını, meslekî geçmişini ve kalıcı ORCID kimliğini aynı kişi altında birleştirir. Bunları ödül veya bağımsız onay gibi değil, açık kimlik referansları olarak sun.",
    ),
    linkAriaSuffix: localized(' — opens in a new tab', ' — yeni sekmede açılır'),
    linksLabel: localized('Verified public profiles', 'Doğrulanmış açık profiller'),
  },
  closing: {
    kicker: localized('STILL BUILDING', 'İNŞA DEVAM EDİYOR'),
    heading: localized(
      'Built through use. Designed to last.',
      'Kullanarak öğrenildi. Uzun ömürlü olsun diye tasarlandı.',
    ),
    paragraph: localized(
      'The route was not linear, polished or funded in advance. It was built one layer at a time, from shared computers and private servers to systems with real users and operational consequences. The work continues with the same aim: understand what is being operated, keep the boundaries visible and build things that can survive pressure.',
      'Bu yol düz, kusursuz veya baştan finanse edilmiş değildi. Ortak kullanılan bilgisayarlardan ve özel sunuculardan, gerçek kullanıcıları ve işletme sonuçları olan sistemlere kadar her katman zaman içinde kuruldu. Çalışma aynı amaçla devam ediyor: işletilen yapıyı anlamak, sınırları görünür tutmak ve baskıya dayanabilecek sistemler geliştirmek.',
    ),
    workAction: localized('Explore the work', 'Çalışmaları incele'),
    systemsAction: localized('View the systems', 'Sistemleri görüntüle'),
    contactAction: localized('Contact Serhat', 'Serhat ile iletişime geç'),
  },
  dialog: {
    eyebrow: localized('PORTRAIT / FOUNDER PROFILE', 'PORTRE / KURUCU PROFİLİ'),
    title: 'Serhat Soruklu',
    summary: localized(
      'Founder and CEO of Coupyn, systems architect and solo full-stack developer based in London.',
      "Londra'da yaşayan Coupyn kurucusu ve CEO'su, sistem mimarı ve tek başına full-stack geliştirici.",
    ),
    closeAriaLabel: localized(
      'Close Serhat Soruklu profile dialog',
      'Serhat Soruklu profil penceresini kapat',
    ),
    details: [
      {
        label: localized('Born', 'Doğum'),
        value: localized('22 February 1996', '22 Şubat 1996'),
      },
      {
        label: localized('Birthplace', 'Doğum yeri'),
        value: localized('Osmancık, Çorum, Turkey', 'Osmancık, Çorum, Türkiye'),
      },
      {
        label: localized('Based in', 'Yaşadığı yer'),
        value: localized('London, United Kingdom', 'Londra, Birleşik Krallık'),
      },
      {
        label: localized('Role', 'Rol'),
        value: localized('Founder & CEO of Coupyn', "Coupyn Kurucusu ve CEO'su"),
      },
    ],
    chips: localized(
      ['Founder', 'Systems architect', 'Full-stack developer', 'Infrastructure operator'],
      ['Kurucu', 'Sistem mimarı', 'Full-stack geliştirici', 'Altyapı işletmecisi'],
    ),
    chipsLabel: localized('Profile roles', 'Profil rolleri'),
    action: localized('Open Coupyn', "Coupyn'i aç"),
    actionAriaLabel: localized('Open Coupyn in a new tab', "Coupyn'i yeni sekmede aç"),
    imageAlt: localized(
      'Portrait of Serhat Soruklu, founder and CEO of Coupyn.',
      "Coupyn kurucusu ve CEO'su Serhat Soruklu'nun portresi.",
    ),
  },
} as const;

export const aboutContent = {
  en: resolveLocalized(aboutSchema, 'en'),
  tr: resolveLocalized(aboutSchema, 'tr'),
} as const;
