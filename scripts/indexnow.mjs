// IndexNow (https://www.indexnow.org/): tells participating search engines (Bing, Yandex, Seznam, Naver and others)
// that every URL in the sitemap may have changed. The key file is public/b389f59c7df5dc2835e3fc134f4c1916.txt.
// Runs at the end of each Vercel production build (VERCEL_ENV=production), so it costs nothing and needs no
// GitHub Actions; engines fetch the pages later, after the deployment is live. Run it by hand after a deploy with
// `npm run indexnow`. It never fails the build: errors are logged and the exit code stays 0.
import { readFileSync } from 'node:fs';

const KEY = 'b389f59c7df5dc2835e3fc134f4c1916';
const HOST = 'carsalesteam.com';

export async function ping() {
  const sitemap = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
    signal: AbortSignal.timeout(15000),
  });
  console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
  return res.status;
}

const auto = process.argv.includes('--if-production');
if (auto && process.env.VERCEL_ENV !== 'production') {
  console.log('IndexNow: skipped (not a production build)');
} else {
  try { await ping(); } catch (e) { console.log(`IndexNow: ping failed (${e.message}); the build continues`); }
}
