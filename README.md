# ToolNest

A lightweight, professional global utility website built with Astro. The first version includes:
- Word & character counter
- Text formatter
- JSON formatter / validator
- About, privacy policy, and contact pages

All three tools run in the visitor's browser. The current implementation does not upload tool input to a server.

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

The privacy policy describes the current analytics and advertising setup. Update it if new services that affect data practices are introduced.

## Project structure
```text
toolnest/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── SiteLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   └── privacy.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```
