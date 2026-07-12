"use client";
import { useState } from "react";
import Link from "next/link";

const CAMPUS_FILES = [
  { file: "A", name: "Seri Iskandar" },
  { file: "A4", name: "Arau" },
  { file: "APB", name: "Alor Gajah" },
  { file: "B_CS", name: "Selangor — CS Faculty (example)" },
  { file: "C", name: "Kota Bharu" },
  { file: "D", name: "Johor" },
  { file: "K", name: "Kuching" },
  { file: "M", name: "Kuala Pilah" },
  { file: "N", name: "Kuala Terengganu" },
  { file: "P", name: "Perlis" },
  { file: "class_index", name: "Class Index (all campuses)" },
];

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="bg-gray-900 dark:bg-black/40 text-green-300 text-sm rounded-xl p-4 overflow-x-auto leading-relaxed border border-white/5">
        <code>{children}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children.trim()); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 transition opacity-0 group-hover:opacity-100"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: string }) {
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {children}
    </span>
  );
}

function Field({ name, type, desc, example }: { name: string; type: string; desc: string; example?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_100px_1fr] gap-1 sm:gap-4 py-3 border-b border-white/5 last:border-0 items-start">
      <code className="text-blue-400 font-mono text-sm font-semibold">{name}</code>
      <span className="text-xs text-purple-400 font-mono bg-purple-400/10 px-2 py-0.5 rounded w-fit">{type}</span>
      <div>
        <p className="text-sm text-gray-300">{desc}</p>
        {example && <p className="text-xs text-gray-500 mt-0.5">e.g. <span className="text-gray-400 font-mono">{example}</span></p>}
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4 scroll-mt-24">
      <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState<"timetable" | "classindex">("timetable");

  return (
    <div className="min-h-screen text-gray-100" style={{ background: "linear-gradient(135deg, #0c1e3d 0%, #112952 50%, #0d3b7a 100%)", backgroundAttachment: "fixed" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0c1e3d]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
              <rect width="52" height="52" rx="12" fill="rgba(29,78,216,0.25)"/>
              <rect x="8" y="10" width="9" height="14" rx="2.5" fill="#93C5FD"/>
              <rect x="8" y="27" width="9" height="15" rx="2.5" fill="#BFDBFE"/>
              <rect x="21.5" y="10" width="9" height="8" rx="2.5" fill="#1D4ED8"/>
              <rect x="21.5" y="21.5" width="9" height="20.5" rx="2.5" fill="#3B82F6"/>
              <rect x="35" y="10" width="9" height="20" rx="2.5" fill="#60A5FA"/>
              <rect x="35" y="33" width="9" height="9" rx="2.5" fill="#93C5FD"/>
            </svg>
            <span className="font-bold text-sm text-white">UiTMGetTable</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full border border-blue-400/20">API Docs</span>
            <a href="https://github.com/sykrwasd/uitmgettable" target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-white transition">GitHub →</a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-44 shrink-0">
          <div className="sticky top-20 space-y-0.5 text-sm border-r border-white/10 pr-4">
            {[
              { href: "#overview", label: "Overview" },
              { href: "#base-url", label: "Base URL" },
              { href: "#timetable", label: "Timetable Files" },
              { href: "#structure", label: "Data Structure" },
              { href: "#classindex", label: "Class Index" },
              { href: "#examples", label: "Examples" },
              { href: "#notes", label: "Notes" },
            ].map(({ href, label }) => (
              <a key={href} href={href}
                className="block px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition text-xs font-medium">
                {label}
              </a>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-12 min-w-0 overflow-x-hidden">

          {/* Hero */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge color="bg-green-500/20 text-green-400 border border-green-500/30">Public</Badge>
              <Badge color="bg-blue-500/20 text-blue-400 border border-blue-500/30">Read-only</Badge>
              <Badge color="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">No auth required</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">UiTMGetTable <span className="text-blue-400">API</span></h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Free, public JSON endpoints for UiTM timetable data. No keys, no rate limits. Just fetch.
            </p>
          </div>

          <Section id="overview" title="Overview">
            <p className="text-gray-400 leading-relaxed">
              All timetable data is served as static JSON files from the <code className="text-blue-300 bg-blue-400/10 px-1.5 py-0.5 rounded text-sm">/timetable/</code> directory.
              Files are scraped from iCress and updated automatically via GitHub Actions. There are two types of files:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                <div className="text-sm font-semibold text-white">Campus Timetable Files</div>
                <div className="text-xs text-gray-400">One file per campus/faculty. Contains all subjects and class groups for that campus.</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                <div className="text-sm font-semibold text-white">Class Index</div>
                <div className="text-xs text-gray-400">Global index mapping class codes (e.g. <code className="text-blue-300">CS2593B</code>) to their subjects across all campuses.</div>
              </div>
            </div>
          </Section>

          <Section id="base-url" title="Base URL">
            <Code>https://uitmgettable.my/timetable/{"{file}"}.json</Code>
            <p className="text-sm text-gray-400">Replace <code className="text-blue-300">{"{file}"}</code> with the campus code. See the full list below.</p>
          </Section>

          <Section id="timetable" title="Timetable Files">
            <p className="text-gray-400 text-sm">
              Each campus has its own file. Selangor campus (B) is split by faculty — use <code className="text-blue-300 bg-blue-400/10 px-1 rounded">B_XX</code> where XX is the faculty code.
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mt-2">
              {(["timetable", "classindex"] as const).map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                    activeTab === t
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}>
                  {t === "timetable" ? "Campus Files" : "Class Index"}
                </button>
              ))}
            </div>

            {activeTab === "timetable" ? (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_2fr] text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 border-b border-white/10">
                  <span>File</span><span>URL</span><span>Campus</span>
                </div>
                <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                  {CAMPUS_FILES.filter(f => f.file !== "class_index").map(({ file, name }) => (
                    <div key={file} className="grid grid-cols-[1fr_1fr_2fr] px-4 py-2.5 text-sm items-center hover:bg-white/5 transition">
                      <code className="text-blue-400 font-mono">{file}.json</code>
                      <a href={`/timetable/${file}.json`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-blue-400 transition truncate">/timetable/{file}.json</a>
                      <span className="text-gray-300">{name}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-500">
                  70 files total. Selangor campus (B) has one file per faculty (B_CS, B_CD, B_EE…)
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div>
                  <code className="text-blue-400 font-mono text-sm">class_index.json</code>
                  <span className="ml-3 text-xs text-gray-500">/timetable/class_index.json</span>
                </div>
                <p className="text-sm text-gray-400">Maps every class group code to an array of sessions across all campuses. 15,000+ entries.</p>
                <Code>{`GET https://uitmgettable.my/timetable/class_index.json`}</Code>
              </div>
            )}
          </Section>

          <Section id="structure" title="Data Structure">
            <p className="text-gray-400 text-sm">Each campus JSON is a flat object where <strong className="text-white">keys are subject codes</strong> (prefixed with a dot) and values are arrays of class groups.</p>

            <Code>{`{
  ".CSC404": [
    {
      "day_time": "MONDAY( 08:00 AM-11:00 AM )",
      "group":    "CS2593B",
      "mode":     "BOTH - Fulltime and Part-time",
      "status":   "First Timer and Repeater",
      "room":     "Bilik BK22",
      "program":  "CD,CS",
      "faculty":  ""
    },
    ...
  ],
  ".ISP542": [ ... ]
}`}</Code>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mt-2">
              <div className="px-4 py-3 border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fields</div>
              <div className="px-4 divide-y divide-white/5">
                <Field name="day_time" type="string" desc="Day and time range of the class session." example="MONDAY( 08:00 AM-11:00 AM )" />
                <Field name="group" type="string" desc="Class group code — the identifier students use to register." example="CS2593B" />
                <Field name="mode" type="string" desc="Who the class is open to." example="BOTH - Fulltime and Part-time" />
                <Field name="status" type="string" desc="Whether first-timers, repeaters, or both can enrol." example="First Timer and Repeater" />
                <Field name="room" type="string" desc="Venue / room code." example="Bilik BK22" />
                <Field name="program" type="string" desc="Programme codes eligible for this class (comma-separated)." example="CD,CS" />
                <Field name="faculty" type="string" desc="Faculty code, if specified." example="CS" />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-300">
              <strong>Subject key prefix:</strong> Subject codes are prefixed with a dot (<code className="font-mono">.CSC404</code>). Strip it with <code className="font-mono text-xs bg-black/30 px-1 rounded">key.startsWith(".") ? key.slice(1) : key</code>
            </div>
          </Section>

          <Section id="classindex" title="Class Index Structure">
            <p className="text-gray-400 text-sm">
              <code className="text-blue-300">class_index.json</code> maps each class group code to an array of sessions. One code can have multiple sessions (lecture + lab).
            </p>
            <Code>{`{
  "CS2593B": [
    {
      "campus":     "B",
      "campusName": "SELANGOR",
      "campusFile": "B_CS",
      "faculty":    "CS",
      "subject":    "CSC404",
      "day_time":   "MONDAY( 08:00 AM-11:00 AM )",
      "room":       "Bilik BK22",
      "mode":       "BOTH - Fulltime and Part-time",
      "status":     "First Timer and Repeater",
      "program":    "CD,CS"
    }
  ]
}`}</Code>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">Additional Fields (vs campus file)</div>
              <div className="px-4 divide-y divide-white/5">
                <Field name="campus" type="string" desc="Short campus code." example="B" />
                <Field name="campusName" type="string" desc="Human-readable campus name." example="SELANGOR" />
                <Field name="campusFile" type="string" desc="File to fetch for full campus data." example="B_CS" />
                <Field name="subject" type="string" desc="Subject code (no dot prefix)." example="CSC404" />
              </div>
            </div>
          </Section>

          <Section id="examples" title="Examples">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Fetch all timetables for Selangor CS faculty</p>
                <Code>{`const res = await fetch("https://uitmgettable.my/timetable/B_CS.json");
const data = await res.json();

// data looks like: { ".CSC404": [...], ".ISP542": [...] }
for (const [key, classes] of Object.entries(data)) {
  const subject = key.startsWith(".") ? key.slice(1) : key;
  console.log(subject, classes);
}`}</Code>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Look up all subjects for class code CS2593B</p>
                <Code>{`const res = await fetch("https://uitmgettable.my/timetable/class_index.json");
const index = await res.json();

const sessions = index["CS2593B"]; // array of sessions
console.log(sessions);
// [{ subject: "CSC404", campus: "B", day_time: "MONDAY...", ... }]`}</Code>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Find all classes on a specific day</p>
                <Code>{`const res = await fetch("https://uitmgettable.my/timetable/A.json");
const data = await res.json();

const monday = Object.entries(data).flatMap(([key, classes]) =>
  classes
    .filter(c => c.day_time.startsWith("MONDAY"))
    .map(c => ({ subject: key.slice(1), ...c }))
);`}</Code>
              </div>
            </div>
          </Section>

          <Section id="notes" title="Notes">
            <div className="space-y-3">
              {[
                { icon: "🔄", title: "Update frequency", desc: "Data is scraped from iCress via GitHub Actions on a schedule. During semester breaks, iCress may clear all data — the last known good snapshot is kept in the repo." },
                { icon: "⚠️", title: "Always cross-check", desc: "This data is scraped and may be stale or incomplete. Always verify with UiTM's official iCress portal before finalising your registration." },
                { icon: "🌐", title: "CORS", desc: "Files are served as static assets — no CORS restrictions. You can fetch directly from any browser or server." },
                { icon: "📦", title: "Open Source", desc: "Scraper, data, and this app are all open source on GitHub. PRs welcome." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-sm text-gray-400">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}
