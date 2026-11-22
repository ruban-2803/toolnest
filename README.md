# ToolNest

A lightweight, professional global utility website built with Astro. The first version includes:
- Word & character counter
- Text formatter
- JSON formatter / validator

All three tools run in the visitor's browser. Text and JSON are not uploaded to a server.

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

## Before public launch
- Replace the example contact email in `src/pages/index.astro`.
- Add a real Privacy Policy and Terms page after reviewing your actual analytics/ad setup.
- Add a custom domain and verify it in Google Search Console.
- Test on mobile and desktop.
- Do not add ads until the site has useful content, a clear privacy policy and a good user experience.

## Project structure
```text
toolnest/
├── public/
│   └── favicon.svg
├── src/
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```
