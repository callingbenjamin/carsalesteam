"""Regenerate only public/og/home.png; existing logos and icons are never modified.

Requires Playwright (PLAYWRIGHT_MODULE) and Chromium (CHROME_BIN). Defaults match
this workspace; override both environment variables on another machine.
"""
import os, pathlib, subprocess, tempfile, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
module = os.environ.get('PLAYWRIGHT_MODULE', '/workspace/propvault/node_modules/playwright/index.mjs')
chrome = os.environ.get('CHROME_BIN', '/home/box/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome')
with tempfile.TemporaryDirectory(prefix='carsalesteam-og-') as tmp:
    doc = pathlib.Path(tmp) / 'og.html'
    logo = re.sub(r'(<text\b[^>]*?)fill="#20292C"', r'\1fill="currentColor"', (ROOT / 'public/brand/carsalesteam-logo.svg').read_text())
    photo = (ROOT / 'public/media/dealerships/poster.jpg').as_uri()
    font = (ROOT / 'public/fonts/geist-latin-v5.woff2').as_uri()
    serif = (ROOT / 'public/fonts/instrument-serif-latin-v5.woff2').as_uri()
    doc.write_text(f'''<!doctype html><html><head><style>
@font-face{{font-family:Geist;src:url({font});font-weight:100 900}}
@font-face{{font-family:Instrument;src:url({serif})}}
*{{box-sizing:border-box}}body{{margin:0;width:1200px;height:630px;color:#F5F2EB;font-family:Geist;background:url({photo}) center/cover}}
.wash{{position:absolute;inset:0;background:linear-gradient(90deg,#0B0F11ee,#0B0F1199 65%,#0B0F1155)}}
main{{position:absolute;inset:0;padding:60px 70px;display:flex;flex-direction:column;justify-content:space-between}}
.brand{{display:flex;align-items:flex-start;gap:14px}}.brand svg{{width:330px;height:auto}}.brand span{{font-size:21px;line-height:1;color:#f5f2eba8;margin-top:21px;letter-spacing:.1px;white-space:nowrap}}
p{{font-size:16px;letter-spacing:3px;margin:0 0 24px;color:#F2B544}}h1{{font:400 86px/.98 Instrument;margin:0;max-width:900px;letter-spacing:-1px}}
.bar{{height:4px;width:120px;background:#F2B544}}
</style></head><body><div class="wash"></div><main><div class="brand">{logo}<span>by Actuathron</span></div><div><p>CARSALESTEAM FOR DEALERSHIPS</p><h1>Every lead deserves<br>a next step.</h1></div><div class="bar"></div></main></body></html>''')
    script = '''import {chromium} from MODULE;
const browser = await chromium.launch({executablePath:CHROME,args:['--no-sandbox','--allow-file-access-from-files']});
const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
await page.goto(URL); await page.evaluate(()=>document.fonts.ready); await page.screenshot({path:OUT}); await browser.close();'''
    import json
    for key, value in [('MODULE',module),('CHROME',chrome),('URL',doc.as_uri()),('OUT',str(ROOT/'public/og/home.png'))]:
        script = script.replace(key,json.dumps(value))
    subprocess.run(['node','--input-type=module','-'],input=script,text=True,check=True,cwd=ROOT)
print('Wrote public/og/home.png (1200 × 630); icons unchanged.')
