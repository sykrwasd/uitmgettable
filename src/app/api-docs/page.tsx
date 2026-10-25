"use client";
import { useState } from "react";
import Link from "next/link";

const BASE = "https://uitmgetable.my";

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

function Fields({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
      <div className="px-4 divide-y divide-white/5">{children}</div>
    </div>
  );
}

function Endpoint({ method, path }: { method: "GET" | "POST"; path: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-sm">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${method === "GET" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>{method}</span>
      <span className="text-gray-200 break-all">{path}</span>
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
              { href: "#campuses", label: "Campuses" },
              { href: "#courses", label: "Courses" },
              { href: "#groups", label: "Class Groups" },
              { href: "#student", label: "Student Timetable" },
              { href: "#example", label: "Example" },
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
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="bg-green-500/20 text-green-400 border border-green-500/30">Live data</Badge>
              <Badge color="bg-blue-500/20 text-blue-400 border border-blue-500/30">Read-only</Badge>
              <Badge color="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Server-side only</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">UiTMGetTable <span className="text-blue-400">API</span></h1>
            <p className="text-gray-400 text-lg max-w-xl">
              The JSON endpoints that power this app. Data is fetched live from UiTM on every request.
            </p>
          </div>

          <Section id="overview" title="Overview">
            <p className="text-gray-400 leading-relaxed">
              Every request is proxied live to UiTM&apos;s timetable system (SIMSweb) and MyStudent, so results always match
              the official portal. Browsing timetables is a three-step flow:
            </p>
            <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
              <li><code className="text-blue-300">/api/campuses</code> — list campuses</li>
              <li><code className="text-blue-300">/api/courses</code> — list subjects offered at a campus</li>
              <li><code className="text-blue-300">/api/groups</code> — get class groups for one subject, using the <code className="text-blue-300">path</code> from step 2</li>
            </ol>
          </Section>

          <Section id="campuses" title="Campuses">
            <Endpoint method="GET" path="/api/campuses" />
            <p className="text-sm text-gray-400">Returns every campus. Selangor (<code className="text-blue-300">B</code>) also needs a faculty code when listing courses.</p>
            <Code>{`[
  { "id": "B",  "text": "SELANGOR CAMPUS - ( Please Select a Faculty )" },
  { "id": "A4", "text": "A4 - UITM KAMPUS TAPAH" },
  { "id": "K",  "text": "K - UITM KAMPUS SUNGAI PETANI" },
  ...
]`}</Code>
          </Section>

          <Section id="courses" title="Courses">
            <Endpoint method="GET" path="/api/courses?campus={campus}&faculty={faculty}" />
            <Fields title="Query parameters">
              <Field name="campus" type="string" desc="Campus id from /api/campuses. Required." example="A4" />
              <Field name="faculty" type="string" desc="Faculty code. Required when campus is B (Selangor), ignored otherwise." example="CD" />
            </Fields>
            <Code>{`[
  { "code": "MAT133", "path": "index_tt.cfm?id1=...&id3=...&id2=..." },
  { "code": "CSC404", "path": "index_tt.cfm?id1=...&id3=...&id2=..." },
  ...
]`}</Code>
            <Fields title="Response fields">
              <Field name="code" type="string" desc="Subject code." example="MAT133" />
              <Field name="path" type="string" desc="Opaque link to the subject's class page. Pass it to /api/groups as-is. It is generated by UiTM per session, so use it soon after fetching rather than storing it." />
            </Fields>
          </Section>

          <Section id="groups" title="Class Groups">
            <Endpoint method="GET" path="/api/groups?path={path}" />
            <Fields title="Query parameters">
              <Field name="path" type="string" desc="The path from /api/courses, URL-encoded. Required." />
            </Fields>
            <Code>{`[
  {
    "day_time": "MONDAY( 10:00 AM-12:00 PM )",
    "group":    "A4AS120110",
    "mode":     "BOTH - Fulltime and Part-time",
    "status":   "First Timer and Repeater",
    "room":     "DK 200B",
    "program":  "AS120",
    "faculty":  "AS"
  },
  ...
]`}</Code>
            <Fields title="Response fields">
              <Field name="day_time" type="string" desc="Day and time range of the session." example="MONDAY( 10:00 AM-12:00 PM )" />
              <Field name="group" type="string" desc="Class group code students register with." example="A4AS120110" />
              <Field name="mode" type="string" desc="Who the class is open to." example="BOTH - Fulltime and Part-time" />
              <Field name="status" type="string" desc="Whether first-timers, repeaters, or both can enrol." example="First Timer and Repeater" />
              <Field name="room" type="string" desc="Venue / room code." example="DK 200B" />
              <Field name="program" type="string" desc="Eligible programme codes. May be empty — UiTM no longer shows this for some subjects." example="AS120" />
              <Field name="faculty" type="string" desc="Faculty code. May be empty for the same reason." example="AS" />
            </Fields>
          </Section>

          <Section id="student" title="Student Timetable">
            <Endpoint method="POST" path="/api/getTimetable" />
            <p className="text-sm text-gray-400">Returns a student&apos;s registered classes from MyStudent. This is what Smart Fetch uses.</p>
            <Code>{`POST /api/getTimetable
Content-Type: application/json

{ "matricNumber": "2023123456" }`}</Code>
            <Code>{`[
  {
    "day": "Monday",
    "day_time": "MONDAY( 10:00 AM-12:00 PM )",
    "timeSlot": "10:00-12:00",
    "class_code": "A4AS120110",
    "subject_code": "MAT133",
    "venue": "DK 200B",
    "lecturer": "..."
  },
  ...
]`}</Code>
            <p className="text-sm text-gray-400">Returns <code className="text-blue-300">500</code> with <code className="text-blue-300">{`{ "error": "Failed to fetch timetable" }`}</code> if the matric number has no published timetable.</p>
          </Section>

          <Section id="example" title="Example">
            <p className="text-sm font-semibold text-gray-300">Get all class groups for MAT133 at Tapah (A4)</p>
            <Code>{`const BASE = "${BASE}";

const courses = await fetch(\`\${BASE}/api/courses?campus=A4\`).then(r => r.json());
const mat133 = courses.find(c => c.code === "MAT133");

const groups = await fetch(
  \`\${BASE}/api/groups?path=\${encodeURIComponent(mat133.path)}\`
).then(r => r.json());

console.log(groups);`}</Code>
          </Section>

          <Section id="notes" title="Notes">
            <div className="space-y-3">
              {[
                { icon: "🖥️", title: "Server-side only", desc: "Responses don't include CORS headers, so browsers on other sites can't call these endpoints directly. Call them from your own server or script." },
                { icon: "🤝", title: "Fair use", desc: "Every request hits UiTM's servers. Cache what you fetch and avoid bulk scraping. Heavy traffic can get the whole service blocked for everyone." },
                { icon: "⚠️", title: "Always cross-check", desc: "Data comes straight from UiTM, but their pages change without notice. Verify with the official portal before finalising your registration." },
                { icon: "📦", title: "Open Source", desc: "The scraper and this app are open source on GitHub. PRs welcome." },
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
