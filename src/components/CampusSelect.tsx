const SELANGOR_FACULTIES = [
  { id: "AA", text: "AA - ARSHAD AYUB GRADUATE BUSINESS SCHOOL" },
  { id: "AC", text: "AC - FACULTY OF ACCOUNTANCY" },
  { id: "AD", text: "AD - FACULTY OF ART AND DESIGN" },
  { id: "AM", text: "AM - FACULTY OF ADMINISTRATIVE SCIENCE AND POLICY STUDIES" },
  { id: "AP", text: "AP - FACULTY OF ARCHITECTURE, PLANNING AND SURVEYING" },
  { id: "AS", text: "AS - FACULTY OF APPLIED SCIENCES" },
  { id: "BA", text: "BA - FACULTY OF BUSINESS AND MANAGEMENT" },
  { id: "BE", text: "BE - FACULTY OF BUILT ENVIRONMENT" },
  { id: "BM", text: "BM - FACULTY OF BUSINESS MANAGEMENT" },
  { id: "CA", text: "CA - COLLEGE OF CREATIVE ARTS" },
  { id: "CD", text: "CD - COLLEGE OF COMPUTING, INFORMATICS AND MATHEMATICS" },
  { id: "CE", text: "CE - COLLEGE OF ENGINEERING" },
  { id: "CF", text: "CF - COLLEGE OF BUILT ENVIRONMENT" },
  { id: "CP", text: "CP - INSTI OF CONTINUING EDUCATION & PROFESSIONAL STUDIES" },
  { id: "CS", text: "CS - FACULTY OF COMPUTER AND MATHEMATICAL SCIENCES" },
  { id: "DS", text: "DS - FACULTY OF DENTISTRY" },
  { id: "EC", text: "EC - FACULTY OF CIVIL ENGINEERING" },
  { id: "ED", text: "ED - FACULTY OF EDUCATION" },
  { id: "EE", text: "EE - FACULTY OF ELECTRICAL ENGINEERING" },
  { id: "EH", text: "EH - FACULTY OF CHEMICAL ENGINEERING" },
  { id: "EM", text: "EM - FACULTY OF MECHANICAL ENGINEERING" },
  { id: "FF", text: "FF - FACULTY OF FILM, THEATRE AND ANIMATION" },
  { id: "HM", text: "HM - FACULTY OF HOTEL AND TOURISM MANAGEMENT" },
  { id: "HS", text: "HS - FACULTY OF HEALTH SCIENCES" },
  { id: "IC", text: "IC - ACADEMY OF CONTEMPORARY ISLAMIC STUDIES" },
  { id: "IM", text: "IM - FACULTY OF INFORMATION MANAGEMENT" },
  { id: "IN", text: "IN - INTERNATIONAL" },
  { id: "LG", text: "LG - ACADEMY OF LANGUAGE STUDIES" },
  { id: "LT", text: "LT - MALAYSIA INSTITUTE OF TRANSPORT" },
  { id: "LW", text: "LW - FACULTY OF LAW" },
  { id: "MC", text: "MC - FACULTY OF COMMUNICATION AND MEDIA STUDIES" },
  { id: "MD", text: "MD - FACULTY OF MEDICINE" },
  { id: "MU", text: "MU - FACULTY OF MUSIC" },
  { id: "PH", text: "PH - FACULTY OF PHARMACY" },
  { id: "SI", text: "SI - FACULTY OF INFORMATION SCIENCE" },
  { id: "SR", text: "SR - FACULTY OF SPORTS SCIENCE AND RECREATION" },
];

type Campus = {
  id: string;
  text: string;
};

interface CampusProps {
  loadingCampus: boolean;
  fetchCampus: Campus[];
  selangor: boolean;
  handleCampusChange: (value: string) => void;
  setFaculty: (value: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchFaculty: any[]; // kept for compatibility, unused
}

export default function CampusSelect({
  loadingCampus,
  fetchCampus,
  handleCampusChange,
  selangor,
  setFaculty,
}: CampusProps) {
  return (
    <>
      {loadingCampus ? (
        <p className="text-gray-700 mb-4">Loading campuses...</p>
      ) : (
        <>
          <select
            className="w-full p-3 rounded-lg bg-white/40 text-gray-500 border border-black/20"
            onChange={(e) => handleCampusChange(e.target.value)}
          >
            <option value="">Select Campus</option>

            {/* Selangor as a special top option */}
            <option value="B - SELANGOR CAMPUS" className="text-black font-semibold">
              B - SELANGOR CAMPUS (Shah Alam)
            </option>

            <option disabled className="text-gray-400">──────────────────</option>

            {/* All other campuses */}
            {fetchCampus.map((row, idx) => (
              <option key={idx} value={row.text} className="text-black">
                {row.text}
              </option>
            ))}
          </select>

          {/* Faculty dropdown — only for Selangor */}
          {selangor && (
            <select
              className="w-full p-3 rounded-lg bg-white/40 text-gray-500 border border-black/20"
              onChange={(e) => setFaculty(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Select Faculty</option>
              {SELANGOR_FACULTIES.map((fac) => (
                <option key={fac.id} value={fac.id} className="text-black">
                  {fac.text}
                </option>
              ))}
            </select>
          )}
        </>
      )}
    </>
  );
}
