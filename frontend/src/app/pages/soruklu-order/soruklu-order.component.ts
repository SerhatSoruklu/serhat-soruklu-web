import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mdiCursorDefaultClickOutline } from '@mdi/js';
import { siX } from 'simple-icons';

import { pageSeoMetadata } from '../../core/seo/seo.config';
import { SeoService } from '../../core/seo/seo.service';
import { PathIconComponent } from '../../shared/icons/path-icon.component';

type OrderLanguage = 'en' | 'tr';

const orderContent = {
  en: {
    htmlLang: 'en-GB',
    seo: pageSeoMetadata.sorukluOrder,
    switchLabel: 'Türkçe oku',
    switchAriaLabel: 'Türkçe oku — read this page in Turkish',
    xAriaLabel: 'Open the official Soruklu Order account on X',
    hero: {
      eyebrow: 'Family stewardship · Established 2025',
      title: 'The Soruklu Order',
      lead: 'A small, voluntary family stewardship initiative.',
      summary:
        'Established in 2025, the Soruklu Order preserves authorised family records, supports practical cooperation, and encourages responsible conduct across generations.',
      boundary:
        'Participation is voluntary and based on informed consent. The initiative does not represent the entire Soruklu family and holds no authority over any person.',
      motto: ['Discipline', 'Responsibility', 'Continuity'],
      emblemAlt: 'Soruklu Order interwoven family emblem',
      markLabel: 'Family mark',
      markCaption: 'Used on authorised initiative materials',
    },
    glance: {
      kicker: 'At a glance',
      heading: 'A limited and practical purpose.',
      facts: [
        { label: 'Established', value: '2025' },
        { label: 'Purpose', value: 'Family stewardship and continuity' },
        { label: 'Participation', value: 'Small, voluntary, and consent-based' },
        { label: 'Coordinated by', value: 'Serhat Soruklu' },
      ],
      publicChannelLabel: 'Public channel',
      publicChannelValue: '@SorukluOrder on X',
    },
    definition: {
      kicker: 'What it is',
      heading: 'A small family initiative, clearly bounded.',
      paragraphs: [
        'The Soruklu Order is the name of a small family project established by Serhat Soruklu in 2025. It provides a voluntary framework for preserving authorised family context, documenting agreed principles, coordinating practical support, and carrying useful knowledge forward.',
        'It is not a lodge, religion, fraternity, political movement, public institution, or source of authority. It has no degrees, ceremonial ranks, professional powers, or jurisdiction over the wider Soruklu family.',
        'Participation creates no authority over non-participants and no obligation beyond what each person freely agrees.',
      ],
      surnameAction:
        'Looking for the surname’s history? Read about the meaning and documented origins of Soruklu.',
    },
    work: {
      kicker: 'What we actually do',
      heading: 'Practical stewardship, not ceremony.',
      introduction:
        'The work is limited to useful family records, voluntary cooperation, and clear conduct.',
      activities: [
        'Preserve authorised family photographs, documents, history, and contextual records',
        'Maintain useful continuity information with the consent of the people involved',
        'Encourage practical support during personal and family difficulties',
        'Document voluntary responsibilities and important shared decisions',
        'Preserve agreed principles and context for future generations',
        'Encourage lawful, responsible, and evidence-based conduct',
      ],
    },
    principles: {
      kicker: 'Principles',
      heading: 'Standards for everyday conduct.',
      introduction:
        'These principles matter only when participants apply them in ordinary decisions.',
      items: [
        {
          title: 'Discipline',
          description: 'Choose deliberate action over impulse and honour reasonable commitments.',
        },
        {
          title: 'Compassion',
          description: 'Respond to difficulty with humanity while maintaining healthy boundaries.',
        },
        {
          title: 'Responsibility',
          description: 'Accept ownership for decisions, obligations, and consequences.',
        },
        {
          title: 'Truth',
          description: 'Prefer evidence, accuracy, correction, and intellectual honesty.',
        },
        {
          title: 'Self-restraint',
          description: 'Develop judgement, patience, and control over one’s own conduct.',
        },
        {
          title: 'Lawful conduct',
          description:
            'Respect the law, due process, individual rights, and legitimate public institutions.',
        },
        {
          title: 'Continuity',
          description: 'Preserve useful knowledge without treating ancestry as entitlement.',
        },
        {
          title: 'Mutual support',
          description:
            'Offer practical help without excusing harmful, reckless, or unlawful behaviour.',
        },
      ],
    },
    participation: {
      kicker: 'Participation and boundaries',
      heading: 'Consent comes before participation.',
      paragraphs: [
        'Participation is by invitation and informed consent. Sharing the Soruklu surname does not create membership, endorsement, involvement, or obligation.',
        'The wider Soruklu family consists of independent people and households. The Soruklu Order does not speak for, control, or collectively represent everyone who shares the surname.',
        'Participants may leave the initiative. Responsibilities may be changed or discontinued by agreement.',
      ],
    },
    responsibilities: {
      kicker: 'Practical responsibilities',
      heading: 'A small set of administrative tasks.',
      introduction: 'Responsibilities exist to keep records, consent, and public boundaries clear.',
      items: [
        {
          title: 'Project coordinator',
          description:
            'Maintains the purpose of the initiative, its authorised materials, and its public boundaries.',
        },
        {
          title: 'Family adviser',
          description: 'Offers family context and non-binding advice when participants request it.',
        },
        {
          title: 'Safeguarding contact',
          description:
            'Encourages appropriate safeguarding action and referral to qualified independent services.',
        },
        {
          title: 'Records custodian',
          description: 'Preserves authorised records and their context with appropriate consent.',
        },
      ],
      clarification:
        'These are informal administrative responsibilities, not ranks, honours, professional licences, or positions of authority. They apply only within the voluntary initiative.',
    },
    safeguarding: {
      kicker: 'Safeguarding and lawful boundaries',
      heading: 'Independent services remain independent.',
      paragraphs: [
        'Participants are expected to act lawfully, respect individual autonomy, and use appropriate safeguarding procedures.',
        'Criminal allegations, medical concerns, legal disputes, and safeguarding matters belong with the relevant independent authorities and qualified professionals.',
        'The initiative does not investigate offences, determine guilt, adjudicate disputes, provide legal or medical services, or replace police, courts, social services, safeguarding bodies, or healthcare providers.',
      ],
    },
    mark: {
      kicker: 'Family mark',
      heading: 'The family mark.',
      body: 'The emblem is the identifying mark used for authorised Soruklu Order materials. It does not represent public office, legal authority, hereditary status, or authority over the wider family.',
    },
    publicInformationAriaLabel: 'Public information',
    updates: {
      kicker: 'Official updates',
      heading: 'One public channel.',
      bodyBefore: 'Official public updates from the initiative are published through ',
      bodyAfter: ' on X.',
      action: 'Open @SorukluOrder on X',
    },
    identity: {
      kicker: 'Identity notice',
      heading: 'Authorised public identity.',
      introduction: 'This page and @SorukluOrder are the initiative’s authorised public channels.',
      domainBefore: 'The domain ',
      domainAfter:
        ' is unaffiliated. It was not created, commissioned, authorised, operated, or endorsed by Serhat Soruklu, the Soruklu Order, its participants, or the wider Soruklu family.',
      conclusion: 'Its content does not represent this initiative.',
    },
    closing: {
      kicker: 'Continuity through conduct',
      heading: 'A voluntary project, carried forward practically.',
      body: 'The Soruklu Order continues through the voluntary choices, responsible conduct, and practical contributions of its participants.',
      motto: ['Discipline', 'Responsibility', 'Continuity'],
      actionsAriaLabel: 'Soruklu Order closing links',
      returnAction: 'Return to Serhat Soruklu',
      updatesAction: 'Official updates',
    },
  },
  tr: {
    htmlLang: 'tr-TR',
    seo: {
      ...pageSeoMetadata.sorukluOrder,
      title: 'Soruklu Order | Aile Mirasını Koruma Girişimi',
      description:
        'Soruklu Order; izinli aile kayıtlarını, karşılıklı desteği, sorumlu davranışı ve devamlılığı gözeten, aile mirasının korunmasına yönelik küçük ve gönüllü bir girişimdir.',
    },
    switchLabel: 'Read in English',
    switchAriaLabel: 'Read in English — read this page in English',
    xAriaLabel: 'Soruklu Order’ın resmî X hesabını aç',
    hero: {
      eyebrow: 'Aile mirasının korunması · 2025’te kuruldu',
      title: 'Soruklu Order',
      lead: 'Aile mirasını korumaya yönelik küçük ve gönüllü bir girişim.',
      summary:
        '2025’te kurulan Soruklu Order; izin verilmiş aile kayıtlarını korur, pratik iş birliğini destekler ve nesiller boyunca sorumlu davranışı teşvik eder.',
      boundary:
        'Katılım gönüllüdür ve bilgilendirilmiş rızaya dayanır. Girişim, Soruklu ailesinin tamamını temsil etmez ve hiç kimse üzerinde yetki sahibi değildir.',
      motto: ['Disiplin', 'Sorumluluk', 'Devamlılık'],
      emblemAlt: 'Soruklu Order’ın iç içe geçmiş aile simgesi',
      markLabel: 'Aile işareti',
      markCaption: 'Girişimin izinli materyallerinde kullanılır',
    },
    glance: {
      kicker: 'Bir bakışta',
      heading: 'Sınırlı ve pratik bir amaç.',
      facts: [
        { label: 'Kuruluş', value: '2025' },
        { label: 'Amaç', value: 'Aile mirasının korunması ve devamlılık' },
        { label: 'Katılım', value: 'Küçük ölçekli, gönüllü ve rızaya dayalı' },
        { label: 'Koordinasyon', value: 'Serhat Soruklu' },
      ],
      publicChannelLabel: 'Kamuya açık kanal',
      publicChannelValue: 'X’te @SorukluOrder',
    },
    definition: {
      kicker: 'Nedir',
      heading: 'Sınırları açık, küçük bir aile girişimi.',
      paragraphs: [
        'Soruklu Order, Serhat Soruklu tarafından 2025’te kurulan küçük bir aile projesinin adıdır. İzin verilmiş aile bağlamını korumak, üzerinde uzlaşılan ilkeleri kayda geçirmek, pratik desteği koordine etmek ve yararlı bilgileri geleceğe taşımak için gönüllü bir çerçeve sunar.',
        'Bir loca, din, kardeşlik teşkilatı, siyasi hareket, kamu kurumu veya otorite kaynağı değildir. Dereceleri, törensel rütbeleri, mesleki yetkileri ya da Soruklu ailesinin bütünü üzerinde yargı yetkisi yoktur.',
        'Katılım, katılmayanlar üzerinde hiçbir yetki doğurmaz ve her kişinin özgürce kabul ettiğinin ötesinde bir yükümlülük oluşturmaz.',
      ],
      surnameAction:
        'Soyadının tarihini mi arıyorsunuz? Soruklu soyadının anlamını ve belgelenmiş kökenlerini okuyun.',
    },
    work: {
      kicker: 'Fiilen yaptıklarımız',
      heading: 'Tören değil, pratik sorumluluk.',
      introduction:
        'Çalışmalar; yararlı aile kayıtları, gönüllü iş birliği ve açık davranış ilkeleriyle sınırlıdır.',
      activities: [
        'İzin verilmiş aile fotoğraflarını, belgeleri, tarihi ve bağlamsal kayıtları korumak',
        'İlgili kişilerin rızasıyla yararlı devamlılık bilgilerini muhafaza etmek',
        'Kişisel ve ailevi zorluklar sırasında pratik desteği teşvik etmek',
        'Gönüllü sorumlulukları ve önemli ortak kararları belgelemek',
        'Üzerinde uzlaşılan ilkeleri ve bağlamı gelecek nesiller için korumak',
        'Hukuka uygun, sorumlu ve kanıta dayalı davranışı teşvik etmek',
      ],
    },
    principles: {
      kicker: 'İlkeler',
      heading: 'Gündelik davranış standartları.',
      introduction:
        'Bu ilkeler ancak katılımcılar onları gündelik kararlarında uyguladığında anlam taşır.',
      items: [
        {
          title: 'Disiplin',
          description: 'Dürtü yerine bilinçli eylemi seçin ve makul taahhütlere sadık kalın.',
        },
        {
          title: 'Şefkat',
          description: 'Sağlıklı sınırları korurken zorluklara insaniyetle karşılık verin.',
        },
        {
          title: 'Sorumluluk',
          description: 'Kararların, yükümlülüklerin ve sonuçların sorumluluğunu üstlenin.',
        },
        {
          title: 'Hakikat',
          description: 'Kanıtı, doğruluğu, düzeltmeyi ve düşünsel dürüstlüğü tercih edin.',
        },
        {
          title: 'Özdenetim',
          description: 'Kendi davranışlarınız üzerinde muhakeme, sabır ve denetim geliştirin.',
        },
        {
          title: 'Hukuka uygun davranış',
          description:
            'Hukuka, adil usule, bireysel haklara ve meşru kamu kurumlarına saygı gösterin.',
        },
        {
          title: 'Devamlılık',
          description: 'Soyu bir ayrıcalık hakkı saymadan yararlı bilgiyi koruyun.',
        },
        {
          title: 'Karşılıklı destek',
          description:
            'Zararlı, pervasız veya hukuka aykırı davranışları mazur görmeden pratik yardım sunun.',
        },
      ],
    },
    participation: {
      kicker: 'Katılım ve sınırlar',
      heading: 'Katılımdan önce rıza gelir.',
      paragraphs: [
        'Katılım davet ve bilgilendirilmiş rızayla gerçekleşir. Soruklu soyadını taşımak; üyelik, onay, dâhil olma veya yükümlülük doğurmaz.',
        'Geniş Soruklu ailesi bağımsız kişi ve hanelerden oluşur. Soruklu Order, soyadını taşıyan herkes adına konuşmaz; onları kontrol etmez veya topluca temsil etmez.',
        'Katılımcılar girişimden ayrılabilir. Sorumluluklar uzlaşmayla değiştirilebilir veya sona erdirilebilir.',
      ],
    },
    responsibilities: {
      kicker: 'Pratik sorumluluklar',
      heading: 'Küçük bir idari görevler bütünü.',
      introduction:
        'Sorumlulukların amacı kayıtları, rızayı ve kamuya açık sınırları net tutmaktır.',
      items: [
        {
          title: 'Proje koordinatörü',
          description: 'Girişimin amacını, izinli materyallerini ve kamuya açık sınırlarını korur.',
        },
        {
          title: 'Aile danışmanı',
          description:
            'Katılımcılar talep ettiğinde aile bağlamı ve bağlayıcı olmayan tavsiye sunar.',
        },
        {
          title: 'Koruma tedbirleri irtibat kişisi',
          description:
            'Uygun koruma adımlarını ve yetkin bağımsız hizmetlere yönlendirmeyi teşvik eder.',
        },
        {
          title: 'Kayıt sorumlusu',
          description: 'İzinli kayıtları ve bağlamlarını uygun rızayla korur.',
        },
      ],
      clarification:
        'Bunlar gayriresmî idari sorumluluklardır; rütbe, onur unvanı, mesleki ruhsat veya yetki makamı değildir. Yalnızca gönüllü girişim içinde geçerlidir.',
    },
    safeguarding: {
      kicker: 'Koruma tedbirleri ve hukuki sınırlar',
      heading: 'Bağımsız hizmetler bağımsız kalır.',
      paragraphs: [
        'Katılımcılardan hukuka uygun davranmaları, bireysel özerkliğe saygı göstermeleri ve uygun koruma prosedürlerini kullanmaları beklenir.',
        'Suç isnatları, tıbbi kaygılar, hukuki uyuşmazlıklar ve korunmaya ilişkin meseleler ilgili bağımsız makamların ve yetkin uzmanların alanıdır.',
        'Girişim suçları soruşturmaz, suçluluğa karar vermez, uyuşmazlıkları hükme bağlamaz, hukuki veya tıbbi hizmet sunmaz; polisin, mahkemelerin, sosyal hizmetlerin, koruma kurumlarının veya sağlık hizmeti sunucularının yerini almaz.',
      ],
    },
    mark: {
      kicker: 'Aile işareti',
      heading: 'Aile işareti.',
      body: 'Simge, Soruklu Order’ın izinli materyallerinde kullanılan ayırt edici işarettir. Bir kamu görevini, hukuki yetkiyi, kalıtsal statüyü veya geniş aile üzerinde otoriteyi temsil etmez.',
    },
    publicInformationAriaLabel: 'Kamuya açık bilgiler',
    updates: {
      kicker: 'Resmî güncellemeler',
      heading: 'Kamuya açık tek kanal.',
      bodyBefore: 'Girişimin kamuya açık resmî güncellemeleri X’teki ',
      bodyAfter: ' hesabında yayımlanır.',
      action: 'X’te @SorukluOrder hesabını aç',
    },
    identity: {
      kicker: 'Kimlik bildirimi',
      heading: 'Yetkilendirilmiş kamuya açık kimlik.',
      introduction:
        'Bu sayfa ve @SorukluOrder, girişimin yetkilendirilmiş kamuya açık kanallarıdır.',
      domainBefore: '',
      domainAfter:
        ' alan adının bu girişimle bağlantısı yoktur. Serhat Soruklu, Soruklu Order, katılımcıları veya Soruklu ailesinin bütünü tarafından oluşturulmamış, yaptırılmamış, yetkilendirilmemiş, işletilmemiş veya onaylanmamıştır.',
      conclusion: 'İçeriği bu girişimi temsil etmez.',
    },
    closing: {
      kicker: 'Davranışla sürdürülen devamlılık',
      heading: 'Pratik biçimde sürdürülen gönüllü bir proje.',
      body: 'Soruklu Order, katılımcılarının gönüllü seçimleri, sorumlu davranışları ve pratik katkılarıyla devam eder.',
      motto: ['Disiplin', 'Sorumluluk', 'Devamlılık'],
      actionsAriaLabel: 'Soruklu Order kapanış bağlantıları',
      returnAction: 'Serhat Soruklu’ya dön',
      updatesAction: 'Resmî güncellemeler',
    },
  },
} as const;

@Component({
  selector: 'app-soruklu-order',
  imports: [PathIconComponent, RouterLink],
  templateUrl: './soruklu-order.component.html',
  styleUrl: './soruklu-order.component.css',
})
export class SorukluOrderComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly seoService = inject(SeoService);

  readonly language = signal<OrderLanguage>('en');
  readonly content = computed(() => orderContent[this.language()]);
  readonly emblemPath = '/assets/brand/soruklu-order/the-soruklu-order-emblem.png';
  readonly officialXUrl = 'https://x.com/sorukluorder';
  readonly xIconPath = siX.path;
  readonly cursorClickIcon = mdiCursorDefaultClickOutline;

  ngOnInit(): void {
    this.applyLanguageMetadata();
  }

  ngOnDestroy(): void {
    this.document.documentElement.lang = 'en';
  }

  toggleLanguage(): void {
    this.language.update((language) => (language === 'en' ? 'tr' : 'en'));
    this.applyLanguageMetadata();
  }

  private applyLanguageMetadata(): void {
    const content = this.content();

    this.document.documentElement.lang = content.htmlLang;
    this.seoService.setMetadata({
      title: content.seo.title,
      description: content.seo.description,
      canonicalUrl: pageSeoMetadata.sorukluOrder.path,
      ogImage: pageSeoMetadata.sorukluOrder.ogImage,
      ogImageAlt: pageSeoMetadata.sorukluOrder.ogImageAlt,
      ogImageHeight: pageSeoMetadata.sorukluOrder.ogImageHeight,
      ogImageType: pageSeoMetadata.sorukluOrder.ogImageType,
      ogImageWidth: pageSeoMetadata.sorukluOrder.ogImageWidth,
      locale: this.language() === 'tr' ? 'tr_TR' : 'en_GB',
      robots: 'index, follow',
    });
  }
}
