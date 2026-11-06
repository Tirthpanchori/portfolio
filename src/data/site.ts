import { projects } from './projects';

const siteUrl = import.meta.env.PUBLIC_SITE_URL;

export const siteOrigin = siteUrl ? new URL(siteUrl).origin : undefined;
export const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';

if (indexable && !siteOrigin?.startsWith('https://')) {
  throw new Error('An indexable portfolio requires an HTTPS PUBLIC_SITE_URL.');
}

export const publicPaths = ['/', '/open-source/', ...projects.map(project => `/projects/${project.slug}/`)];
