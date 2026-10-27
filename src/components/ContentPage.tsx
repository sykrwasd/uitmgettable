import Link from "next/link";

const NAV = [
  { href: "/", label: "Timetable" },
  { href: "/guide", label: "Guide" },
  { href: "/campuses", label: "Campuses" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
];

export default function ContentPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-[#0c1e3d] dark:via-[#112952] dark:to-[#0d3b7a] px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-4">
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="text-blue-700 dark:text-blue-300 hover:underline">
              {label}
            </Link>
          ))}
        </nav>
        <article className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-white/10 p-6 sm:p-10 text-gray-700 dark:text-gray-300 space-y-6 text-sm leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_section]:space-y-2 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">{title}</h1>
          {updated && <p className="text-xs text-gray-500">Last updated: {updated}</p>}
          {children}
        </article>
      </div>
    </main>
  );
}
