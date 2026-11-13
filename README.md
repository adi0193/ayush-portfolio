# Ayush Kumar Portfolio

Personal portfolio showcasing Ayush Kumar's electrical engineering, solar PV design, AutoCAD drafting, and technical communication skills.

Project pages include preliminary designs, academic concepts, and self-initiated samples. Each project's status is identified on the site.

## Run locally

Install [Node.js](https://nodejs.org/), then run these commands from the project folder:

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Build

```bash
npm run build
```

## Deployment (Vercel)

This is a static single-page app (Vite + React Router). `vercel.json` rewrites every
non-file path (e.g. `/projects`, `/resume`) to `index.html` so direct visits and page
refreshes on any route load the app instead of returning Vercel's `404: NOT_FOUND`.
Real files in `public/` and `dist/assets/` are served as-is, and missing files still 404.

Requires Node.js 22 (see `engines` in `package.json`). No environment variables are needed.
