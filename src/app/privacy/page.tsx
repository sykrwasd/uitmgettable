import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — UitmGetTable",
  description: "How UitmGetTable handles your data, cookies and advertising.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-[#0c1e3d] dark:via-[#112952] dark:to-[#0d3b7a] px-4 py-12">
      <article className="max-w-2xl mx-auto bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-white/10 p-6 sm:p-10 text-gray-700 dark:text-gray-300 space-y-6 text-sm leading-relaxed">
        <Link href="/" className="text-blue-600 dark:text-blue-400 text-xs font-semibold">← Back to UitmGetTable</Link>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-500">Last updated: 25 October 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">What we collect</h2>
          <p>
            UitmGetTable does not require an account. When you use Smart Fetch, your matric number is sent to our
            server only to retrieve your public class timetable from UiTM and is not stored. Classes you add are saved
            in your own browser (localStorage) and never leave your device.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p>
            We use Google Analytics and Umami to understand how the site is used (for example, page views and which
            features are popular). These tools may set cookies and collect anonymised usage data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Advertising</h2>
          <p>
            We use Google AdSense to show ads, which helps keep this site free. Third-party vendors, including Google,
            use cookies to serve ads based on your prior visits to this and other websites. Google&apos;s use of
            advertising cookies enables it and its partners to serve ads based on your visits to this site and/or
            other sites on the Internet.
          </p>
          <p>
            You can opt out of personalised advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Google Ads Settings</a>
            , or opt out of third-party vendors&apos; cookies at{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">aboutads.info</a>.
            Learn more in{" "}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">how Google uses data from partner sites</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Not affiliated with UiTM</h2>
          <p>
            UitmGetTable is an independent, open-source student project and is not affiliated with or endorsed by
            Universiti Teknologi MARA. Always cross-check with UiTM&apos;s official timetable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contact</h2>
          <p>
            Questions or requests? Open an issue on{" "}
            <a href="https://github.com/sykrwasd/uitmgettable/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">GitHub</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
