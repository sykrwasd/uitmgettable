import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "UiTM Campus & Faculty Codes — UitmGetTable",
  description:
    "Full list of UiTM campus codes by state and Selangor (Shah Alam) faculty codes used in the UiTM class timetable.",
};

const STATES: { state: string; campuses: [string, string][] }[] = [
  { state: "Selangor", campuses: [["B", "Selangor campus (Shah Alam) — choose a faculty"], ["B10", "UiTM Kampus Dengkil"]] },
  { state: "Perak", campuses: [["A", "UiTM Kampus Seri Iskandar"], ["A4", "UiTM Kampus Tapah"]] },
  { state: "Pahang", campuses: [["C", "UiTM Kampus Jengka"], ["C3", "UiTM Kampus Raub"]] },
  { state: "Kelantan", campuses: [["D", "UiTM Kampus Machang"], ["D2", "UiTM Kampus Kota Bharu"]] },
  { state: "Johor", campuses: [["J", "UiTM Kampus Segamat"], ["J4", "UiTM Kampus Pasir Gudang"]] },
  { state: "Kedah", campuses: [["K", "UiTM Kampus Sungai Petani"]] },
  { state: "Melaka", campuses: [["M", "UiTM Kampus Alor Gajah"], ["M1", "UiTM Kampus Bandaraya Melaka"], ["M3", "UiTM Kampus Jasin"]] },
  {
    state: "Negeri Sembilan",
    campuses: [["N", "UiTM Kampus Kuala Pilah"], ["N3", "UiTM Kampus Kuala Pilah"], ["N4", "UiTM Kampus Seremban 3"], ["N5", "UiTM Kampus Rembau"]],
  },
  { state: "Pulau Pinang", campuses: [["P", "UiTM Kampus Bukit Mertajam"], ["P2", "UiTM Kampus Bertam"], ["P4", "UiTM Kampus Permatang Pauh"]] },
  { state: "Perlis", campuses: [["R", "UiTM Kampus Arau"]] },
  { state: "Sabah", campuses: [["S", "UiTM Kampus Kota Kinabalu"], ["S2", "UiTM Kampus Tawau"]] },
  { state: "Sarawak", campuses: [["Q", "UiTM Kampus Samarahan"], ["Q5", "UiTM Kampus Samarahan 2"], ["Q6", "UiTM Kampus Mukah"]] },
  {
    state: "Terengganu",
    campuses: [["T", "UiTM Kampus Dungun"], ["T4", "UiTM Kampus Bukit Besi"], ["T5", "UiTM Kampus Kuala Terengganu (Cendering)"]],
  },
];

const SELANGOR_COURSE_GROUPS: [string, string][] = [
  ["APB", "Language courses"],
  ["CITU", "CITU courses"],
  ["HEP", "Co-curriculum courses"],
];

const PARTNER_COLLEGES: [string, string][] = [
  ["FAB", "Kolej Widad"],
  ["FC", "Kolej Yayasan Pahang"],
  ["FEW", "East West International College"],
  ["FFE", "Kolej Felcra"],
  ["FJ", "Kolej Islam Yayasan Pelajaran Johor"],
  ["FJA", "Institut Sains dan Teknologi Darul Takzim"],
  ["FL", "Institut Profesional Baitulmal Kuala Lumpur"],
  ["FM", "Kolej Antarabangsa Unifield"],
  ["FMA", "Melaka International College of Science & Technology"],
  ["FMM", "Malaysian Consortium for Education Mauritius"],
  ["FN", "Kolej Uniti"],
  ["FQ", "Kolej SATT"],
  ["FQI", "Qaiwan International University"],
];

const FACULTIES: [string, string][] = [
  ["AA", "Arshad Ayub Graduate Business School"],
  ["AC", "Faculty of Accountancy"],
  ["AD", "Faculty of Art and Design"],
  ["AM", "Faculty of Administrative Science and Policy Studies"],
  ["AP", "Faculty of Architecture, Planning and Surveying"],
  ["AS", "Faculty of Applied Sciences"],
  ["BA", "Faculty of Business and Management"],
  ["BE", "Faculty of Built Environment"],
  ["BM", "Faculty of Business Management"],
  ["CA", "College of Creative Arts"],
  ["CD", "College of Computing, Informatics and Mathematics"],
  ["CE", "College of Engineering"],
  ["CF", "College of Built Environment"],
  ["CP", "Institute of Continuing Education & Professional Studies"],
  ["CS", "Faculty of Computer and Mathematical Sciences"],
  ["DS", "Faculty of Dentistry"],
  ["EC", "Faculty of Civil Engineering"],
  ["ED", "Faculty of Education"],
  ["EE", "Faculty of Electrical Engineering"],
  ["EH", "Faculty of Chemical Engineering"],
  ["EM", "Faculty of Mechanical Engineering"],
  ["FF", "Faculty of Film, Theatre and Animation"],
  ["HM", "Faculty of Hotel and Tourism Management"],
  ["HS", "Faculty of Health Sciences"],
  ["IC", "Academy of Contemporary Islamic Studies"],
  ["IM", "Faculty of Information Management"],
  ["IN", "International"],
  ["LG", "Academy of Language Studies"],
  ["LT", "Malaysia Institute of Transport"],
  ["LW", "Faculty of Law"],
  ["MC", "Faculty of Communication and Media Studies"],
  ["MD", "Faculty of Medicine"],
  ["MU", "Faculty of Music"],
  ["PH", "Faculty of Pharmacy"],
  ["SI", "Faculty of Information Science"],
  ["SR", "Faculty of Sports Science and Recreation"],
];

function CodeTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-left text-sm">
      <tbody className="divide-y divide-black/5 dark:divide-white/10">
        {rows.map(([code, name]) => (
          <tr key={code}>
            <td className="py-1.5 pr-4 w-16 font-mono font-bold text-blue-700 dark:text-blue-300">{code}</td>
            <td className="py-1.5">{name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CampusesPage() {
  return (
    <ContentPage title="UiTM campus and faculty codes">
      <section>
        <p>
          UiTM&apos;s class timetable identifies every campus by a short code, such as <code>A4</code> for Tapah or{" "}
          <code>K</code> for Sungai Petani. The same codes appear at the start of many class group names, so knowing
          yours makes searching faster. This page lists every campus available in the timetable, grouped by state, plus
          the faculty codes used for the Selangor campus.
        </p>
        <p>
          To see the classes offered at a campus, choose it on the <Link href="/">timetable page</Link>. New to
          planning? Read the <Link href="/guide">timetable planning guide</Link>.
        </p>
      </section>

      <section>
        <h2>Campuses by state</h2>
        <div className="space-y-4">
          {STATES.map(({ state, campuses }) => (
            <div key={state}>
              <h3 className="font-semibold text-gray-900 dark:text-white">{state}</h3>
              <CodeTable rows={campuses} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Selangor campus (Shah Alam) faculties</h2>
        <p>
          The Selangor campus (<code>B</code>) is large enough that its timetable is split by faculty. After choosing
          Selangor, pick your faculty from the list below.
        </p>
        <CodeTable rows={FACULTIES} />
        <p>Some university-wide courses offered at the Selangor campus have their own codes:</p>
        <CodeTable rows={SELANGOR_COURSE_GROUPS} />
      </section>

      <section>
        <h2>Partner colleges</h2>
        <p>
          These colleges also appear in UiTM&apos;s class timetable. They are listed separately because they are not
          UiTM campuses.
        </p>
        <CodeTable rows={PARTNER_COLLEGES} />
      </section>

      <section>
        <p className="text-xs text-gray-500">
          Codes and names follow UiTM&apos;s official class timetable. UiTM occasionally adds or renames campuses; if
          something here looks out of date, please{" "}
          <a href="https://github.com/sykrwasd/uitmgettable/issues/new" target="_blank" rel="noopener noreferrer">
            let us know
          </a>
          .
        </p>
      </section>
    </ContentPage>
  );
}
