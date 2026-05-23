# cracked.com Chrome extension

One-click cracked-tier check on any LinkedIn profile + live tier badges on your feed.

## Load locally for development

1. Open `chrome://extensions` (or `edge://extensions`)
2. Toggle "Developer mode"
3. Click "Load unpacked"
4. Select this `extension/` directory

## Files

- `manifest.json` — MV3 manifest with `host_permissions` for linkedin.com
- `content.js` + `content.css` — runs on linkedin.com profiles + feed
- `background.js` — service worker (forwards popup clicks)
- `popup.html` — extension action popup
- `icons/` — 16/48/128px PNG icons (TODO: add these before Chrome Web Store submission)

## Submission to Chrome Web Store

Per /plan-eng-review Distribution Plan: first MV3 submission with LinkedIn DOM permissions typically takes **5-10 business days**, not the optimistic 1-3 day baseline. The site continues working on the bookmarklet alone if the extension is in review at the end of Week 2.

Steps:
1. Add a `screenshots/` directory with 3-5 screenshots showing the extension in action.
2. Pack the extension: `zip -r cracked-extension-v1.0.0.zip extension/`
3. Submit at https://chrome.google.com/webstore/devconsole/.
4. Wait for review.

Edge Add-ons and Firefox are deferred to v1.1.
