// IndexNow ping, run after a production deploy is live. middleware.js calls this path once per edge instance on
// the first live request to the production domain. The response is cached on Vercel's CDN for the life of the
// deployment (the cache resets on each new deploy), so later calls are served from cache and do not ping again.
// Repeat submissions are harmless to IndexNow. Never throws. The key file is public/<key>.txt.
import { SITE } from '../src/site.mjs';

const KEY = 'b389f59c7df5dc2835e3fc134f4c1916';
const PATHS = ['/', '/guides', ...SITE.guides.map(s => `/guides/${s}`), '/privacy'];

export default {
  async fetch(request) {
    const host = new URL(request.url).host;
    const deploy = process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown';
    if (process.env.VERCEL_ENV !== 'production' || host !== new URL(SITE.url).host) {
      return new Response('skipped\n', { headers: { 'cache-control': 'no-store' } });
    }
    let status = 'error';
    try {
      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE.url}/${KEY}.txt`, urlList: PATHS.map(p => SITE.url + p) }),
        signal: AbortSignal.timeout(8000),
      });
      status = res.status;
    } catch (e) { status = `error ${e.message}`; }
    console.log(`IndexNow ping after go-live: deployment ${deploy}, commit ${process.env.VERCEL_GIT_COMMIT_SHA ?? ''}, ${PATHS.length} URLs, status ${status}, at ${new Date().toISOString()}`);
    return new Response(`IndexNow ${status}\n`, {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'vercel-cdn-cache-control': 'max-age=31536000' },
    });
  },
};
