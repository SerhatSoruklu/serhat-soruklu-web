import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { mdiArchiveOutline, mdiFileStarOutline, mdiReddit, mdiTextBoxMultipleOutline } from '@mdi/js';

type ArticleTopic = 'Architecture' | 'Infrastructure' | 'Product' | 'Founder notes';
type WritingTopic = 'All' | ArticleTopic;

interface PublishedArticle {
  index: string;
  topic: ArticleTopic;
  title: string;
  description: string;
  publishedLabel: string;
  publishedIso: string;
  readTime: string;
  source: 'Hashnode' | 'Medium';
  url: string;
}

interface ArchiveArticle {
  topic: ArticleTopic;
  title: string;
  publishedLabel: string;
  publishedIso: string;
  readTime: string;
  source: 'Medium';
  url: string;
}

interface CommunityThread {
  community: 'r/node';
  title: string;
  description: string;
  publishedLabel: string;
  publishedIso: string;
  scoreLabel: string;
  commentsLabel: string;
  url: string;
}

@Component({
  selector: 'app-writing',
  imports: [MatIconModule, RouterLink],
  templateUrl: './writing.component.html',
  styleUrl: './writing.component.css'
})
export class WritingComponent {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  readonly topics: readonly WritingTopic[] = ['All', 'Architecture', 'Infrastructure', 'Product'];
  readonly activeTopic = signal<WritingTopic>('All');
  readonly redditIconPath = mdiReddit;

  readonly featuredArticle: PublishedArticle = {
    index: '01',
    topic: 'Infrastructure',
    title: 'PermaFlow: My $50/Month Architecture Handling Millions of Requests',
    description: 'Coupyn’s infrastructure is small on purpose. This is the practical account of using CDN caching, commodity servers, and strict operating choices to make a limited budget carry real load.',
    publishedLabel: '28 Oct 2025',
    publishedIso: '2025-10-28',
    readTime: '5 min read',
    source: 'Medium',
    url: 'https://medium.com/@coupyn/permaflow-my-50-month-architecture-handling-millions-of-requests-79c205e33f2d'
  };

  readonly communityThread: CommunityThread = {
    community: 'r/node',
    title: 'I built a platform that handles millions of Node.js requests a day on $50/month',
    description: 'The useful part is the pushback. Node engineers challenged the averages, caching assumptions, concurrency, payload weight, and cost. My replies add the context the original piece left out.',
    publishedLabel: '23 Oct 2025',
    publishedIso: '2025-10-23',
    scoreLabel: '122 points',
    commentsLabel: '64 comments',
    url: 'https://www.reddit.com/r/node/comments/1oeba1r/i_built_a_platform_that_handles_millions_of/'
  };

  readonly articles: readonly PublishedArticle[] = [
    {
      index: '02',
      topic: 'Infrastructure',
      title: 'Why I Prefer Bare-Metal Infrastructure Over Managed Platforms',
      description: 'Managed platforms remove decisions until the hidden decisions become the problem. A case for keeping deployment, logs, backups, and recovery legible.',
      publishedLabel: '7 May 2026',
      publishedIso: '2026-05-07',
      readTime: '4 min read',
      source: 'Hashnode',
      url: 'https://systemsbyserhat.hashnode.dev/why-i-prefer-bare-metal-infrastructure-over-managed-platforms'
    },
    {
      index: '03',
      topic: 'Architecture',
      title: 'Runtime Reasoning vs Design-Time Reasoning',
      description: 'Two systems can produce convincing answers while behaving very differently underneath. The important difference is where reasoning is allowed to happen.',
      publishedLabel: '27 Mar 2026',
      publishedIso: '2026-03-27',
      readTime: '4 min read',
      source: 'Medium',
      url: 'https://medium.com/@coupyn/runtime-reasoning-vs-design-time-reasoning-a76d4009789c'
    },
    {
      index: '04',
      topic: 'Architecture',
      title: 'Most Systems Don’t Fail Loudly. They Drift.',
      description: 'The interface still works. The labels still look right. Underneath, the meaning has moved. A short note from building bounded concept definitions.',
      publishedLabel: '30 Mar 2026',
      publishedIso: '2026-03-30',
      readTime: '3 min read',
      source: 'Medium',
      url: 'https://medium.com/@coupyn/most-systems-dont-fail-loudly-they-drift-f36b04ba75b7'
    },
    {
      index: '05',
      topic: 'Product',
      title: 'The Missing Layer: Why Trust, Not Scale, Decides Who Wins',
      description: 'Distribution is cheap. Belief is not. A product note on turning usage, recency, and feedback into visible trust signals inside Coupyn.',
      publishedLabel: '7 Apr 2026',
      publishedIso: '2026-04-07',
      readTime: '3 min read',
      source: 'Medium',
      url: 'https://medium.com/@coupyn/the-missing-layer-why-trust-not-scale-decides-who-wins-and-how-coupyn-is-solving-it-61967c9cc2b8'
    }
  ];

  readonly archiveArticles: readonly ArchiveArticle[] = [
    {
      topic: 'Product',
      title: 'We Don’t Follow Coupon Industry Standards. We’re Rebuilding Them.',
      publishedLabel: '8 Apr 2026',
      publishedIso: '2026-04-08',
      readTime: '3 min read',
      source: 'Medium',
      url: 'https://medium.com/@coupyn/we-dont-follow-coupon-industry-standards-we-re-rebuilding-them-1c69fe2f43d7'
    },
    {
      topic: 'Founder notes',
      title: 'The $100 Million Lesson: Why Offices Are Optional',
      publishedLabel: '1 Nov 2025',
      publishedIso: '2025-11-01',
      readTime: '2 min read',
      source: 'Medium',
      url: 'https://medium.com/@coupyn/the-100-million-lesson-why-offices-are-obsolete-and-how-coupyn-defines-the-era-of-algorithmic-d6c0fdf89efa'
    }
  ];

  readonly filteredArticles = computed(() => {
    const topic = this.activeTopic();

    return topic === 'All'
      ? this.articles
      : this.articles.filter((article) => article.topic === topic);
  });

  constructor() {
    this.registerIcons();
  }

  selectTopic(topic: WritingTopic): void {
    this.activeTopic.set(topic);
  }

  private registerIcons(): void {
    const icons = {
      'writing-archive': mdiArchiveOutline,
      'writing-featured': mdiFileStarOutline,
      'writing-selected': mdiTextBoxMultipleOutline
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`) // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
