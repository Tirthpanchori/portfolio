import { indexable, siteOrigin } from '../data/site';

export function GET() {
  const sitemap = indexable ? `Sitemap: ${siteOrigin}/sitemap.xml\n` : '';
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
