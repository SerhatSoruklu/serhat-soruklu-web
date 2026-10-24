# GitHub activity

The GitHub page renders a verified, dated contribution-calendar snapshot from GitHub's GraphQL API for `SerhatSoruklu`, starting in 2023. This is deliberately a snapshot, not a live counter or an estimate. The page displays its retrieval date. SSR and client hydration consume the same data, and no third-party request, GitHub credential or API quota is needed when visitors open the page.

Refresh with an authenticated GitHub CLI session:

```bash
npm --prefix frontend run refresh:github-activity
```

The script fetches each calendar year and verifies that daily counts sum to the GitHub-reported annual total before replacing `github-activity.data.ts`. It writes aggregate daily dates, counts and intensity levels; annual commit contribution counts; annual restricted contribution counts; and the retrieval timestamp. It never exports credentials, private repository names, paths, commit messages or file contents. The latest year's range ends at retrieval time; no future squares are presented as historical data.

Contribution counts include more than commits. GitHub's restricted totals are not broken down by contribution type, so the UI labels commit contributions separately and never claims that private contributions are all commits. Intensity uses GitHub's own quartiles. The calendar includes leap years, keyboard arrow navigation, touch inspection, hover/focus tooltips, local horizontal scrolling on narrow screens, light theme colours and reduced-motion support.

Refresh the snapshot when publishing an updated activity record. No production token or scheduled refresh has been added.
