# UiTMGetTable

**Free, open-source UiTM timetable generator — built for students, by students.**

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

🌐 **Live:** [uitmgetable.my](https://uitmgetable.my)

---

## Features

- **By Campus** — select campus → faculty → subject → add class groups to your timetable
- **Smart Fetch** — enter your matric number to import your registered timetable, then add more classes on top
- **Customizable** — change background color, block text color, label color, or pick a one-click theme
- **Themes** — 8 built-in themes (Matcha Strawberry, Creator's Favourite, Midnight Ocean, and more)
- **Manage Classes** — remove individual subjects from your timetable
- **Edit Mode** — click any class block to edit day, time, or venue
- **Image Export** — save your timetable as a full-resolution PNG (respects custom colors)
- **Dark Mode** — full dark mode support throughout
- **Mobile friendly** — collapsible left panel on small screens

---

## How it works

Timetable data is fetched **live** from UiTM's timetable system (SIMSweb) on every request, so it always matches the official portal. `src/lib/uitm-scraper.ts` reads the form tokens from the SIMSweb page at runtime (no hardcoded tokens) and caches them for 10 minutes.

```
GET  /api/campuses
GET  /api/courses?campus={campus}&faculty={faculty}
GET  /api/groups?path={path}
POST /api/getTimetable   { "matricNumber": "..." }
```

See [API Docs](https://uitmgetable.my/api-docs) for the full reference.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Dropdowns | react-select |
| Image export | html-to-image |
| Data | Live scraping of SIMSweb + MyStudent via Next.js API routes |
| Hosting | Cloudflare Workers (OpenNext) |
| Analytics | Umami + Google Analytics |

---

## Project Structure

```
uitmgettable/
├── src/
│   ├── app/                    # Next.js pages (/, /api-docs, /api/*)
│   │   └── hooks/              # useCampus, useFaculty, useSubjects, useSelectedClass…
│   ├── components/             # UI components
│   │   ├── FetchTimetable.tsx  # Main timetable grid + customization
│   │   ├── CampusSelect.tsx    # Campus/faculty dropdowns + rsStyles helper
│   │   └── …
│   └── lib/
│       ├── uitm-scraper.ts     # Live SIMSweb scraper (tokens, courses, groups)
│       └── api.ts              # Client helpers for the /api routes
├── scripts/
│   └── generate-og.mjs         # Regenerates public/og-image.png
├── wrangler.jsonc              # Cloudflare Workers config
└── open-next.config.ts         # OpenNext adapter config
```

---

## Getting Started

```bash
git clone https://github.com/sykrwasd/uitmgettable.git
cd uitmgettable
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Regenerate OG image (after design changes)

```bash
node scripts/generate-og.mjs
```

### Preview / deploy on Cloudflare

```bash
npm run preview   # build and run locally in the Workers runtime
npm run deploy    # build and deploy to Cloudflare
```

---

## Contributing

PRs welcome. Fork, improve, submit.

---

## License

MIT — free to use, modify, and share.

---

Made with ❤️ by [@sykrwasd](https://github.com/sykrwasd)  
⭐ Star the repo if it helped you!
