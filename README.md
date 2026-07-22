# UiTMGetTable

**Free, open-source UiTM timetable generator — built for students, by students.**

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

🌐 **Live:** [uitmgettable.my](https://uitmgettable.my)

---

## Features

- **By Campus** — select campus → faculty → subject → add class groups to your timetable
- **By Class Code** — type a class code (e.g. `CS2593B`), preview all subjects, add at once
- **Compare Mode** — compare multiple class sections side-by-side as separate timetables
- **Smart Fetch** — enter your matric number to auto-load your registered timetable
- **Customizable** — change background color, block text color, label color, or pick a one-click theme
- **Themes** — 8 built-in themes (Matcha Strawberry, Creator's Favourite, Midnight Ocean, and more)
- **Manage Classes** — remove individual subjects from your timetable
- **Edit Mode** — click any class block to edit day, time, or venue
- **Image Export** — save your timetable as a full-resolution PNG (respects custom colors)
- **Dark Mode** — full dark mode support throughout
- **Mobile friendly** — collapsible left panel on small screens

---

## How it works

Timetable data is scraped from iCress and stored as **static JSON files** in `public/timetable/`. No live scraping happens at runtime — the app just fetches JSON.

```
GET https://uitmgettable.my/timetable/{campus}.json
GET https://uitmgettable.my/timetable/class_index.json
```

See [API Docs](https://uitmgettable.my/api-docs) for the full reference.

### Data update schedule

A GitHub Actions workflow runs on a schedule, scrapes iCress, and commits updated JSON files to the repo. Vercel redeploys automatically on push.

> ⚠️ iCress sometimes clears all timetable data between semesters. If data looks empty, the last known good snapshot is kept in the repo.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Dropdowns | react-select |
| Image export | html-to-image |
| Scraper | Cheerio + Axios (Node.js script) |
| Hosting | Vercel |
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
│   │   ├── ClassCodeSearch.tsx # By Class Code search
│   │   ├── CompareClasses.tsx  # Compare mode
│   │   ├── CampusSelect.tsx    # Campus/faculty dropdowns + rsStyles helper
│   │   └── …
│   └── lib/                    # parseTime, utils, api helpers
├── scripts/
│   └── scraperAll.js           # Scrapes iCress + builds class_index.json
├── public/
│   └── timetable/              # 70 campus JSON files + class_index.json
└── .github/workflows/
    └── scrape.yml              # Scheduled scrape action
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

### Run scraper manually

```bash
node scripts/scraperAll.js
```

This scrapes all campuses from iCress and rebuilds `public/timetable/` and `class_index.json`.

---

## Contributing

PRs welcome. Fork, improve, submit.

---

## License

MIT — free to use, modify, and share.

---

Made with ❤️ by [@sykrwasd](https://github.com/sykrwasd)  
⭐ Star the repo if it helped you!
