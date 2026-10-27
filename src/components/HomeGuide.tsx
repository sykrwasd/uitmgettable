import Link from "next/link";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is UitmGetTable an official UiTM website?",
    a: (
      <>
        No. It&apos;s an independent, open-source student project and isn&apos;t affiliated with or endorsed by
        Universiti Teknologi MARA. Class data is read from UiTM&apos;s public class timetable, so always cross-check
        with the official portal before you register.
      </>
    ),
  },
  {
    q: "Where does the class data come from?",
    a: (
      <>
        Every time you choose a subject, its class groups are fetched live from UiTM&apos;s public class timetable, so
        you see what UiTM has published at that moment. Smart Fetch reads your registered classes from UiTM&apos;s
        public MyStudent timetable service.
      </>
    ),
  },
  {
    q: "Is my matric number saved?",
    a: (
      <>
        No. When you use Smart Fetch, your matric number is only used to look up your timetable and isn&apos;t stored.
        The classes you add are saved in your own browser, not on our servers. See the{" "}
        <Link href="/privacy">privacy policy</Link> for details.
      </>
    ),
  },
  {
    q: "Why can't I find my subject or class?",
    a: (
      <>
        UiTM publishes each semester&apos;s timetable shortly before registration, so subjects may show no classes until
        then. Also make sure you picked the right campus — and, for Selangor, the faculty that offers the subject. The{" "}
        <Link href="/campuses">campus code list</Link> can help.
      </>
    ),
  },
  {
    q: "Can I mix imported and manually added classes?",
    a: (
      <>
        Yes. Import your registered classes with Smart Fetch, then add more subjects from the campus list. They all
        appear on the same timetable.
      </>
    ),
  },
  {
    q: "How do I save my timetable to my phone?",
    a: (
      <>
        Tap <strong>Save as Image</strong>. On a phone it opens the share sheet, where you can save the picture to your
        photos or send it straight to a chat. On a computer it downloads a PNG file.
      </>
    ),
  },
  {
    q: "Can I change how my timetable looks?",
    a: (
      <>
        Yes — use <strong>Colors</strong> to set a colour per subject, <strong>Themes</strong> for one-click styles, and{" "}
        <strong>Settings</strong> to change the time range, font size, hide weekends, or use your own picture as the
        background or class colour.
      </>
    ),
  },
  {
    q: "Is it free?",
    a: (
      <>
        Yes, completely. The site is kept running by ads and donations, and the code is open source on{" "}
        <a href="https://github.com/sykrwasd/uitmgettable" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </>
    ),
  },
];

export default function HomeGuide() {
  return (
    <section className="max-w-4xl mx-auto mt-16 mb-12 px-2 space-y-10 text-gray-700 dark:text-gray-300">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          How to build your UiTM timetable
        </h2>
        <p className="leading-relaxed">
          UitmGetTable turns UiTM&apos;s class timetable into a weekly grid you can actually read. Instead of copying
          each class&apos;s day, time and room into a notes app, pick your subjects and the timetable draws itself — so
          you can spot clashes, compare groups, and plan backups before course registration opens.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              n: "1",
              t: "Add your classes",
              d: "Choose your campus and subject, then click a class group to add all its sessions. Or use Smart Fetch to import the classes you're already registered for.",
            },
            {
              n: "2",
              t: "Check your week",
              d: "Look for overlapping blocks and awkward gaps. Swap groups until the week works, and note backup groups in case your first choice fills up.",
            },
            {
              n: "3",
              t: "Save and share",
              d: "Customise the colours or add your own background, then use Save as Image to keep your timetable on your phone.",
            },
          ].map(({ n, t, d }) => (
            <div key={n} className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-white/40 dark:border-white/10">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">STEP {n}</div>
              <div className="font-bold text-gray-900 dark:text-white mt-1">{t}</div>
              <p className="text-sm mt-1 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
        <p className="text-sm">
          Want more detail? Read the full <Link href="/guide" className="text-blue-600 dark:text-blue-400 underline">timetable planning guide</Link>{" "}
          or look up your <Link href="/campuses" className="text-blue-600 dark:text-blue-400 underline">campus code</Link>.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Frequently asked questions</h2>
        <div className="space-y-2">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-white/50 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10 px-4 py-3 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline"
            >
              <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white list-none flex justify-between gap-4">
                {q}
                <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm mt-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
