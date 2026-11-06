// Public GitHub PR metadata and descriptions checked on 1 November 2026.
// Verification evidence: .impeccable/review/open-source/github-evidence.json.
export const contributionGroups = [
  {
    repository: 'jpdevhub/FreshScanAi', name: 'FreshScanAi',
    prs: [
      { number: 83, title: 'Rate limits for scan APIs', summary: 'Per-user request limits and clear 429 responses for scan endpoints.', mergedAt: '2026-06-07', featured: true },
      { number: 111, title: 'Rate limits for the markets API', summary: 'Extended rate-limit coverage to the maps/markets endpoint.', mergedAt: '2026-06-17', featured: false },
    ],
  },
  {
    repository: 'ionfwsrijan/PatchPilot', name: 'PatchPilot',
    prs: [
      { number: 266, title: 'CSV export for scan findings', summary: 'Export filtered or selected findings with CSV field escaping.', mergedAt: '2026-07-08', featured: false },
      { number: 327, title: 'Chart styles without raw HTML', summary: 'Replaced raw HTML injection with React text rendering for chart styles.', mergedAt: '2026-07-18', featured: true },
      { number: 344, title: 'FastAPI lifespan migration', summary: 'Moved database initialization and cleanup startup into a lifespan context.', mergedAt: '2026-08-01', featured: false },
    ],
  },
  {
    repository: 'Coder-s-OG-s/MergeShip', name: 'MergeShip',
    prs: [
      { number: 610, title: 'Contributor CSV export', summary: 'Added an export action and download control for contributor records.', mergedAt: '2026-07-08', featured: false },
      { number: 790, title: 'Review feedback where it belongs', summary: 'Added a Needs Changes tab, status and mentor feedback to My PRs.', mergedAt: '2026-07-26', featured: false },
      { number: 826, title: 'Analytics export and report sharing', summary: 'CSV reports and expiring public read-only report snapshots.', mergedAt: '2026-07-31', featured: false },
      { number: 851, title: 'Fix route and server-action failures', summary: 'Resolved a route collision and non-async server-action exports.', mergedAt: '2026-08-02', featured: true },
    ],
  },
  {
    repository: 'Eshajha19/Algo-Infinity-Verse', name: 'Algo-Infinity-Verse',
    prs: [
      { number: 2120, title: 'Context-aware loading messages', summary: 'Fixed quiz loading labels and added page-specific splash messages.', mergedAt: '2026-07-11', featured: false },
      { number: 2124, title: 'Difficulty cues beyond color', summary: 'Added icons to practice-problem difficulty badges.', mergedAt: '2026-07-11', featured: false },
      { number: 2258, title: 'Visible offline status', summary: 'Added the missing practice-page offline banner and its styling.', mergedAt: '2026-07-13', featured: false },
      { number: 2998, title: 'First-visit startup crash fix', summary: 'Initialized default progress before reading saved browser data.', mergedAt: '2026-07-25', featured: false },
    ],
  },
  {
    repository: 'jpdevhub/Agronavis-AI-Farm-Assistant', name: 'Agronavis AI Farm Assistant',
    prs: [
      { number: 61, title: 'Disease data from Supabase', summary: 'Replaced hardcoded symptoms and treatments with database lookups.', mergedAt: '2026-06-24', featured: false },
    ],
  },
  {
    repository: 'vmDeshpande/ai-agent-automation', name: 'ai-agent-automation',
    prs: [
      { number: 114, title: 'Responsive dashboard and sidebar', summary: 'Mobile drawer navigation and responsive dashboard spacing.', mergedAt: '2026-06-14', featured: false },
    ],
  },
  {
    repository: 'Winter262005/Project-Toolsuite', name: 'Project Toolsuite',
    prs: [
      { number: 375, title: 'Honor the selected source timezone', summary: 'Fixed timezone conversion to use the selected zone and date-specific offsets.', mergedAt: '2026-07-16', featured: false },
    ],
  },
];

export const contributionCount = contributionGroups.reduce((total, group) => total + group.prs.length, 0);
export const featuredContributions = contributionGroups.flatMap(group => group.prs
  .filter(pr => pr.featured)
  .map(pr => ({ ...pr, repository: group.repository, project: group.name })));
export const contributionUrl = (repository: string, number: number) => `https://github.com/${repository}/pull/${number}`;
