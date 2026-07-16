# NFC Asset Link Demo

Static demo website for NFC-tagged assets. Scanning an NFC tag opens the matching asset page with basic information, a request form, and cycle count inventory details.

## Live pages

| Page | Purpose |
|------|---------|
| `index.html` | Asset list + how NFC linking works |
| `asset.html?id=AST-001` … `AST-005` | Per-asset information (NFC deep link target) |
| `cycle-count.html` | Cycle count inventory overview |

## Demo assets

1. **AST-001** — Portable Ultrasound Unit  
2. **AST-002** — Infusion Pump Rack  
3. **AST-003** — Laptop · Field Service (variance example)  
4. **AST-004** — Calibration Multimeter  
5. **AST-005** — Mobile Crash Cart  

Request form used on each asset page: https://forms.office.com/r/wQM2EHkQBg

## NFC tag setup

Write an NDEF URI record on each tag pointing to the asset URL, for example:

```text
https://<your-user>.github.io/nfc-asset-demo/asset.html?id=AST-001
```

## GitHub Pages

After the repo is published, enable **Settings → Pages → Deploy from branch → `main` / root** (or `/docs` if you move files). The site is plain HTML/CSS/JS and needs no build step.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
npx --yes serve .
```
