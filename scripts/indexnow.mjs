// IndexNow (https://www.indexnow.org/): tells participating search engines (Bing, Yandex, Seznam, Naver and others)
// that every URL in the sitemap may have changed. The key file is public/b389f59c7df5dc2835e3fc134f4c1916.txt.
// Manual use only: `npm run indexnow` after a build. Production deploys ping automatically after go-live through
// middleware.js and api/indexnow-*.js. It never exits non-zero.
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

try { await ping(); } catch (e) { console.log(`IndexNow: ping failed (${e.message})`); }
