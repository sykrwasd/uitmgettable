// scripts/buildClassIndex.js
// Builds public/timetable/class_index.json
// Maps class codes (e.g. "CS1101B") -> list of subjects across all campuses

const fs = require("fs");
const path = require("path");

const TIMETABLE_DIR = path.join(__dirname, "../public/timetable");
const OUTPUT_FILE = path.join(TIMETABLE_DIR, "class_index.json");

const index = {}; // { [classCode]: [{ campus, campusFile, subject, ...classData }] }

// Load campus name map from index.json
const indexData = JSON.parse(fs.readFileSync(path.join(TIMETABLE_DIR, "index.json"), "utf-8"));
const campusNames = {};
for (const c of indexData.campuses) {
  campusNames[c.campus] = c.name;
}

const files = fs.readdirSync(TIMETABLE_DIR).filter(
  (f) => f.endsWith(".json") && f !== "index.json" && f !== "class_index.json"
);

for (const file of files) {
  const fileBase = file.replace(".json", ""); // e.g. "C3" or "B_AC"
  let campus, faculty;

  if (fileBase.startsWith("B_")) {
    campus = "B";
    faculty = fileBase.slice(2); // "AC"
  } else {
    campus = fileBase;
    faculty = "";
  }

  const campusName = campusNames[campus] || campus;
  const data = JSON.parse(fs.readFileSync(path.join(TIMETABLE_DIR, file), "utf-8"));

  for (const [subjectKey, classes] of Object.entries(data)) {
    const subject = subjectKey.startsWith(".") ? subjectKey.slice(1) : subjectKey;

    for (const cls of classes) {
      const code = cls.group?.trim();
      if (!code) continue;

      if (!index[code]) index[code] = [];

      // Avoid duplicates (same campus+subject+group)
      const exists = index[code].some(
        (e) => e.campus === campus && e.faculty === faculty && e.subject === subject
      );
      if (!exists) {
        index[code].push({
          campus,
          faculty,
          campusName,
          campusFile: fileBase,
          subject,
          day_time: cls.day_time,
          room: cls.room,
          mode: cls.mode,
          status: cls.status,
          program: cls.program,
        });
      }
    }
  }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
console.log(`Built class_index.json — ${Object.keys(index).length} unique class codes`);
