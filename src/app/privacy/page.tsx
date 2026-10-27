import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Privacy Policy — UitmGetTable",
  description: "How UitmGetTable handles your data, cookies and advertising.",
};

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy Policy" updated="25 October 2026">
      <section>
        <h2>What we collect</h2>
        <p>
          UitmGetTable does not require an account. When you use Smart Fetch, your matric number is sent to our server
          only to retrieve your public class timetable from UiTM and is not stored. Classes you add are saved in your
          own browser (localStorage) and never leave your device.
        </p>
      </section>

      <section>
        <h2>Analytics</h2>
        <p>
          We use Google Analytics and Umami to understand how the site is used (for example, page views and which
          features are popular). These tools may set cookies and collect anonymised usage data.
        </p>
      </section>

      <section>
        <h2>Advertising</h2>
        <p>
          We use Google AdSense to show ads, which helps keep this site free. Third-party vendors, including Google, use
          cookies to serve ads based on your prior visits to this and other websites. Google&apos;s use of advertising
          cookies enables it and its partners to serve ads based on your visits to this site and/or other sites on the
          Internet.
        </p>
        <p>
          You can opt out of personalised advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          , or opt out of third-party vendors&apos; cookies at{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          . Learn more in{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            how Google uses data from partner sites
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Not affiliated with UiTM</h2>
        <p>
          UitmGetTable is an independent, open-source student project and is not affiliated with or endorsed by
          Universiti Teknologi MARA. Always cross-check with UiTM&apos;s official timetable.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions or requests? Open an issue on{" "}
          <a href="https://github.com/sykrwasd/uitmgettable/issues" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </section>
    </ContentPage>
  );
}
