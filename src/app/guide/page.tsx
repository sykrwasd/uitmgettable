import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "How to Plan Your UiTM Timetable — UitmGetTable",
  description:
    "A step-by-step guide to planning a clash-free UiTM class timetable before course registration, with tips on choosing groups and backup options.",
};

export default function GuidePage() {
  return (
    <ContentPage title="How to plan your UiTM timetable">
      <section>
        <p>
          Course registration goes much more smoothly when you already know exactly which class groups you want — and
          which ones to fall back on if they fill up. This guide walks through planning your timetable ahead of time
          using UitmGetTable.
        </p>
      </section>

      <section>
        <h2>1. Know which subjects you need</h2>
        <p>
          Start with your programme structure for the semester: the core subjects, any electives you plan to take, and
          university courses such as languages or co-curriculum. If you&apos;re unsure what to take, check with your
          academic advisor before you start building a timetable. Write down the subject codes (for example{" "}
          <code>MAT133</code> or <code>CSC404</code>) — that&apos;s what you&apos;ll search for.
        </p>
      </section>

      <section>
        <h2>2. Wait for the timetable to be published</h2>
        <p>
          UiTM publishes class timetables for each new semester before registration opens. Until then, subjects may show
          no class groups at all. If a subject you expect is missing, the timetable for your campus probably hasn&apos;t
          been released yet — check again closer to registration.
        </p>
      </section>

      <section>
        <h2>3. Add your subjects</h2>
        <ol>
          <li>
            On the <Link href="/">timetable page</Link>, choose your campus under <strong>Add manually</strong>. For
            Selangor (Shah Alam and nearby), also choose your faculty.
          </li>
          <li>Pick a subject. Every class group offered for it appears under <strong>Available Classes</strong>.</li>
          <li>
            Each group shows its day, time, room, and whether it&apos;s open to first-timers, repeaters, or both.
            Click a group to add all its sessions to your timetable.
          </li>
          <li>Repeat for each subject.</li>
        </ol>
        <p>
          Already registered and just want to see your week? Use <strong>Smart Fetch</strong> instead: enter your matric
          number and your registered classes are imported in one go.
        </p>
      </section>

      <section>
        <h2>4. Check for clashes and gaps</h2>
        <p>
          Once your subjects are on the grid, look for overlapping blocks — two classes at the same time can&apos;t both
          be attended. If you add a group with a session in exactly the same slot as one already on your timetable,
          the app warns you and doesn&apos;t add it, but classes that only partly overlap (say 10:00–12:00 and
          11:00–13:00) aren&apos;t caught automatically, so check the grid with your own eyes. Also look at the gaps between classes: a single free hour is useful for lunch or travel between
          buildings, while long gaps spread across every day can make your week tiring. If a group clashes or leaves an
          awkward schedule, remove it and try another group of the same subject.
        </p>
      </section>

      <section>
        <h2>5. Plan backup groups</h2>
        <p>
          Popular groups fill up quickly once registration opens. For every subject, note down one or two alternative
          groups that still fit your timetable. That way, if your first choice is full, you can switch immediately
          instead of rebuilding your whole week under pressure.
        </p>
      </section>

      <section>
        <h2>6. Save it and register</h2>
        <p>
          Use <strong>Save as Image</strong> to keep a copy of your plan — on a phone it opens the share sheet so you can
          save it straight to your photos. Then register through UiTM&apos;s official course registration system using
          the group codes from your plan.
        </p>
        <p>
          UitmGetTable only helps you plan; it doesn&apos;t register you for anything. Always confirm the final details
          against the official timetable, as classes, rooms and times can change.
        </p>
      </section>

      <section>
        <h2>Tips</h2>
        <ul>
          <li>Use <strong>Settings</strong> to hide weekends or narrow the time range if your classes are all on weekdays.</li>
          <li>Give each subject a distinct colour under <strong>Colors</strong> so the week is easier to read at a glance.</li>
          <li>Click any class block to edit its time or venue if something changes after registration.</li>
          <li>
            Not sure of your campus code? See the <Link href="/campuses">list of UiTM campuses and codes</Link>.
          </li>
        </ul>
      </section>
    </ContentPage>
  );
}
