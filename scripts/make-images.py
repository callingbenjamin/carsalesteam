"""Regenerates the share images (public/og/*.png) and public/apple-touch-icon.png.

Run after changing a headline or a hero photo:
    npm run build && python3 scripts/make-images.py
Needs Google Chrome on the PATH as google-chrome (headless screenshots, no other dependencies).
"""
import json, pathlib, html, tempfile, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
# The logo files are the source of truth: the ivory version sits on the graphite cards, the mark alone on the icon.
LOGO = (ROOT / 'public/brand/carsalesteam-logo-ivory.svg').read_text()
MARK = (ROOT / 'public/brand/carsalesteam-mark.svg').read_text()
FONT = (ROOT / 'public/fonts/geist-latin-v5.woff2').as_uri()

def card(eyebrow, lines, photo=None):
    bg = f'url({photo.as_uri()}) center/cover' if photo else '#20292C'
    return f'''<!doctype html><html><head><style>
@font-face{{font-family:Geist;src:url({FONT}) format('woff2');font-weight:400 700}}
body{{margin:0;width:1200px;height:630px;font-family:Geist;color:#F5F2EB;background:{bg};position:relative;overflow:hidden}}
.wash{{position:absolute;inset:0;background:linear-gradient(90deg,#20292Cf2 0%,#20292Ccc 48%,#20292C55 100%)}}
.in{{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}}
.brand svg{{display:block;height:46px;width:300px}}
.eyebrow{{font-size:16px;letter-spacing:3px;text-transform:uppercase;color:#aaa8a3;margin-bottom:22px}}
h1{{font-weight:500;font-size:74px;line-height:1.08;letter-spacing:-2.8px;margin:0;max-width:820px}}
.bar{{width:120px;height:4px;background:#F2B544}}
</style></head><body><div class="wash"></div><div class="in">
<div class="brand">{LOGO}</div>
<div><div class="eyebrow">{html.escape(eyebrow)}</div><h1>{'<br>'.join(html.escape(l) for l in lines)}</h1></div>
<div class="bar"></div></div></body></html>'''

ICON = f'''<!doctype html><html><body style="margin:0;width:180px;height:180px;background:#20292C;display:grid;place-items:center">
<div style="width:128px">{MARK.replace('<svg ', '<svg width="128" ')}</div></body></html>'''

def shot(doc, out, w, h):
    tmp = pathlib.Path(tempfile.mkdtemp()) / 'page.html'
    tmp.write_text(doc)
    # Load from a file:// page so the local font and photo are allowed to load.
    subprocess.run(['google-chrome', '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
                    '--allow-file-access-from-files', '--virtual-time-budget=3000', f'--window-size={w},{h}',
                    f'--screenshot={out}', tmp.as_uri()], check=True, capture_output=True)

d = json.loads((ROOT / 'src/content/sectors/dealerships.json').read_text())
shot(card('Dealership enquiry follow-up for dealer groups', d['hero']['headline'], ROOT / 'public/media/dealerships/poster.jpg'),
     ROOT / 'public/og/home.png', 1200, 630)
shot(ICON, ROOT / 'public/apple-touch-icon.png', 180, 180)
print('wrote public/og/home.png and public/apple-touch-icon.png')
