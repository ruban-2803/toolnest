# ToolNest

A lightweight, professional global utility website built with Astro. The first version includes:
- Word & character counter
- Text formatter
- JSON formatter / validator
- PNG, JPG, and WEBP image converters
- CSV to JSON and JSON to CSV converters
- About, privacy policy, and contact pages

All tools run in the visitor's browser. The current implementation does not upload tool input or files to a server. Image conversions use the Canvas API; CSV conversions handle quoted fields, commas, escaped quotes, and embedded line breaks.

## Requirements
- Node.js 20.3.0+ (Node 22 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Astro (usually http://localhost:4321).

## Production build
```bash
npm run build
npm run preview
```
The static site is generated in `dist/`.

## Deploy to Cloudflare Pages
1. Push this project to a GitHub repository.
2. In Cloudflare Pages, create a project and connect the repository.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Deploy.

## Contact details
No contact email is currently configured. To add one, set `CONTACT_EMAIL` in `src/pages/contact.astro` to a real, monitored address.

Analytics and advertising are not implemented. Update the privacy policy if services that affect data practices are introduced.

## Project structure
```text
toolnest/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── SiteLayout.astro
│   ├── components/
│   │   └── FileConverter.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── privacy.astro
│   │   └── tools/
│   │       ├── png-to-jpg.astro
│   │       ├── jpg-to-png.astro
│   │       ├── png-to-webp.astro
│   │       ├── jpg-to-webp.astro
│   │       ├── webp-to-jpg.astro
│   │       ├── csv-to-json.astro
│   │       └── json-to-csv.astro
│   ├── scripts/
│   │   └── file-converters.js
│   └── styles/
│       └── global.css
├── tests/
│   └── file-converters.test.js
├── astro.config.mjs
├── package.json
└── tsconfig.json
```
