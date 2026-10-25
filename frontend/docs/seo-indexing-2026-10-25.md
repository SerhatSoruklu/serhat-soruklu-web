# Indexing and identity SEO audit — 25 October 2026

This records a read-only audit of the public website and Google's official
documentation on 25 October 2026. The supplied Search Console overview was last
updated on **16 October 2026**, so its status predates this live audit. The
screenshots reported 5 indexed pages, 11 discovered but not indexed pages, and
3 redirected URLs. Public HTTP checks cannot establish current index status.

This audit records the site before the accompanying changes were released.
Publishing follows the user's explicit authorization and the verified GitHub
release flow in `AGENTS.md`; local audit results alone do not establish deployment.

## What the public audit established

- The homepage, `/about`, `/press`, and every canonical URL shown in the supplied
  examples returned HTTP 200 during this audit.
- Tested pages contained a single correct HTTPS non-www self-canonical, an
  `index, follow` directive, and a Googlebot directive allowing large previews.
- Initial HTML contained page-specific titles, headings, content, and real
  anchor `href` links. All 17 sitemap routes were reachable through these links.
- `/robots.txt` allowed crawling and identified the canonical sitemap.
- `/sitemap.xml` returned successfully and listed 17 canonical page URLs.
- Requests using ordinary browser and Googlebot user-agent strings received
  direct HTTP 308 redirects from all three homepage variants below to
  `https://serhatsoruklu.com/`:
  - `http://www.serhatsoruklu.com/`
  - `https://www.serhatsoruklu.com/`
  - `http://serhatsoruklu.com/`

These findings show technical eligibility at the time of testing, not guaranteed
indexing or proof of access from Google's verified crawler infrastructure.

## Why the redirect exclusions should remain

“Page with redirect” is expected for the three alternate homepage URLs. Their
purpose is to consolidate visitors and indexing signals at the preferred URL.
Google describes them as noncanonical URLs that are not indexed themselves.
The destination's index status is assessed separately. Do not remove correct
redirects or return duplicate HTTP 200 pages merely to clear this report.

Source: [Google's Page indexing report](https://support.google.com/webmasters/answer/7440203?hl=en).

## What “Discovered — currently not indexed” means

Google knows the URL but has not crawled it. This explains an empty last-crawl
date. Google may defer requests to avoid overloading a site, but this status
alone does not prove a server-capacity problem on this website. The live checks
found no obvious current crawl block for the supplied canonical examples.

Check actual Crawl Stats and URL Inspection evidence before attributing a cause.
Google's minimum technical requirements are public access, a successful HTTP
response, and indexable content; satisfying them does not guarantee indexing.

Sources: [Indexing report](https://support.google.com/webmasters/answer/7440203?hl=en),
[technical requirements](https://developers.google.com/search/docs/essentials/technical),
[crawl troubleshooting](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors).

## Identity images and Knowledge Panels

Keep the genuine original selfie as the primary identity image. Generated
portrait variations should be described accurately and retain available source
and rights information. They do not establish independent evidence of identity.
Google supports IPTC digital source types and may surface trusted C2PA metadata.

Google's **ProfilePage structured data** guidance recommends relevant, crawlable,
high-resolution image variants in **1:1, 4:3, and 16:9**, with at least **50,000
total pixels** each. These are profile-markup recommendations, **not published
Knowledge Panel portrait requirements**. Five different portraits or native 4K
resolution are not stated requirements. Preserve accurate native dimensions;
an enlarged export does not gain original detail through upscaling.

Knowledge Panels are generated automatically from sources across the web. Image
collections may draw from Google Images. If a personal panel exists, its verified
subject can claim it and suggest corrections or an available featured image.
Schema markup, image quantity, and sitemap submission cannot guarantee a panel.

Sources: [ProfilePage markup](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
[image metadata](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata),
[Knowledge Panels](https://support.google.com/knowledgepanel/answer/9163198?hl=en).

Use stable Person identifiers, factual profile links, and relevant visible
content. Images should appear on useful landing pages with descriptive alt text
and captions; a public asset folder alone is insufficient discovery. Image
sitemap entries can supplement those pages. Maintain truthful `lastmod` dates;
Google ignores sitemap `priority` and `changefreq` values.

Sources: [Image SEO](https://developers.google.com/search/docs/appearance/google-images),
[image sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps),
[sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## After an explicitly authorized deployment

1. Verify the public sitemap, its canonical page URLs, images, response codes,
   robots directives, and rendered metadata against the deployed changes.
2. In the correct Search Console property, inspect the canonical homepage and
   `/about`, followed by several affected canonical URLs. Run **Test live URL**
   and confirm the page is available, indexable, and renders its main content.
3. Check **Crawl Stats → Host status**, plus **Security issues** and **Manual
   actions**. If access failures appear, investigate verified crawler access and
   server logs; a spoofed Googlebot user-agent test cannot replace that evidence.
4. Submit or confirm `https://serhatsoruklu.com/sitemap.xml`. Request indexing for
   a few important changed canonical pages, within the tool's quota. Repeatedly
   submitting unchanged URLs or sitemaps does not accelerate crawling.
5. Test `/about` with Google's Rich Results Test for applicable profile markup.
   Then monitor canonical selection and indexing after Google recrawls. Allow
   days to weeks; neither live tests nor a validation request promises indexing.
6. Leave the three alternate-host/protocol redirect exclusions in place. Re-run
   validation only for issues actually corrected; these redirects are intended.

Source: [Request recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## Follow-on work with lasting value

Keep owned professional profiles consistent and link to the official website
where appropriate. Publish substantive first-hand project evidence: working
examples, source repositories, technical explanations, and clearly dated results.
Earn relevant independent references through actual work, collaboration, or
coverage; do not invent endorsements, credentials, reviews, or citations. Existing
first-party press material should remain identified as first-party material.

This is practical guidance inferred from Google's emphasis on useful, reliable
content and its description of cross-web Knowledge Panel sources, not a formula
or eligibility threshold for obtaining a panel.

Source: [Helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Implementation and verification

- Added canonical WebPage nodes for ordinary routes and kept About's ProfilePage.
  All routes share the stable Person identity and its original-photo ImageObject,
  including exact dimensions, content URL, encoding format and subject reference.
- Added image sitemap entries for the original photo on About and Press, and the
  four visibly labelled AI-assisted portrait variants on Press. The page sitemap
  still has 17 canonical URLs. Updated only About and Press modification dates.
- Saved four native portrait PNGs in `public/assets/portraits/profile/`, with
  responsive AVIF/WebP previews, truthful source metadata, a provenance manifest
  and native downloads on the existing Press gallery. Two expressions were
  revised at the user's request. The original selfie is unchanged.
- Extended production smoke checks to cover every sitemap page's final status,
  canonical, indexability, SSR heading/schema and distinct title, plus canonical
  redirects and all five discoverable native portrait images.
- Validation passed: root lint, type/security checks and production build;
  unit/backend/security tests; 52 existing SEO and Press browser checks;
  production artifact verification and production SSR smoke. Browser checks
  include all ten standard test viewports, theme variants and image downloads.

Prompts and native output limits are recorded in `profile-portrait-prompts.txt`
and `founder-portraits.md`. Do not infer deployment or a changed Google indexing
state from local tests. Publication and deployment must be verified separately
through the GitHub release workflow and public endpoint checks.
