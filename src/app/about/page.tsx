import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "About — UitmGetTable",
  description:
    "UitmGetTable is a free, open-source timetable builder made by a UiTM student to make planning classes faster and less painful.",
};

export default function AboutPage() {
  return (
    <ContentPage title="About UitmGetTable">
      <section>
        <p>
          UitmGetTable is a free timetable builder for Universiti Teknologi MARA (UiTM) students. It lets you pick
          your subjects and class groups, see them laid out on a weekly grid, spot clashes at a glance, and save the
          result as an image you can keep on your phone or share with friends.
        </p>
      </section>

      <section>
        <h2>Why it exists</h2>
        <p>
          Every semester, UiTM students go through the same routine: open the official class timetable, search for
          each subject one by one, copy the day, time and room of every group into a notes app or a spreadsheet, and
          then try to work out which combination of groups doesn&apos;t clash. It&apos;s slow, it&apos;s easy to make
          mistakes, and it has to be redone whenever a group fills up.
        </p>
        <p>
          UitmGetTable was built to remove that busywork. Instead of copying times by hand, you choose a subject and
          its available groups appear instantly. Add the ones you want and the timetable draws itself.
        </p>
      </section>

      <section>
        <h2>What it can do</h2>
        <ul>
          <li>
            <strong>Browse by campus</strong> — pick any UiTM campus (and faculty for Selangor), choose a subject, and
            add class groups to your timetable.
          </li>
          <li>
            <strong>Smart Fetch</strong> — enter your matric number to import the classes you&apos;re already registered
            for, then add more on top.
          </li>
          <li>
            <strong>Customise</strong> — colours, themes, time range, font size, and even your own background image.
          </li>
          <li>
            <strong>Save as Image</strong> — export a clean, high-resolution picture of your timetable.
          </li>
        </ul>
        <p>
          New to the site? The <Link href="/guide">timetable planning guide</Link> walks through the whole process.
        </p>
      </section>

      <section>
        <h2>Where the data comes from</h2>
        <p>
          Class information is fetched live from UiTM&apos;s public class timetable each time you load a subject, so it
          reflects what the university has published at that moment. Registered timetables for Smart Fetch come from
          UiTM&apos;s public MyStudent timetable service. Because the data comes straight from UiTM, it can change
          without notice — always cross-check with the official portal before you register.
        </p>
      </section>

      <section>
        <h2>Not affiliated with UiTM</h2>
        <p>
          UitmGetTable is an independent student project. It is not operated, endorsed or supported by Universiti
          Teknologi MARA.
        </p>
      </section>

      <section>
        <h2>Open source</h2>
        <p>
          The full source code is public on{" "}
          <a href="https://github.com/sykrwasd/uitmgettable" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          . Bug reports, feature ideas and pull requests are welcome. If something looks wrong, please{" "}
          <a href="https://github.com/sykrwasd/uitmgettable/issues/new" target="_blank" rel="noopener noreferrer">
            report a problem
          </a>
          .
        </p>
        <p>
          The project is backed by{" "}
          <a href="https://krackeddevs.com/" target="_blank" rel="noopener noreferrer">
            KrackedDevs
          </a>{" "}
          and kept free by ads and donations from users.
        </p>
      </section>
    </ContentPage>
  );
}
