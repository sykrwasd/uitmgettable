// lib/api.ts — reads from static JSON files in public/timetable/

export async function getCampus() {
  const res = await fetch("/timetable/index.json");
  if (!res.ok) throw new Error("Failed to fetch campus list");
  const data = await res.json();
  // map to { id, text } format expected by CampusSelect
  return data.campuses
    .filter((c: { status: string; courses: number }) => c.status === "ok" && c.courses > 0)
    .map((c: { campus: string; name: string }) => ({
      id: c.campus,
      text: `${c.campus} - ${c.name}`,
    }));
}

export async function getFaculty() {
  // No longer needed — faculties are embedded in campus JSON
  return [];
}

export async function getSubject(campus: string, _faculty: string) {
  if (!campus) return [];
  const res = await fetch(`/timetable/${campus}.json`);
  if (!res.ok) throw new Error(`Failed to fetch timetable for campus ${campus}`);
  const data = await res.json();
  // return course codes as { course, href } — href unused but kept for compatibility
  return Object.keys(data).map((code) => ({
    course: code,
    href: "",
  }));
}

export async function getGroup(campus: string, _faculty: string, subject: string) {
  if (!campus || !subject) return [];
  const res = await fetch(`/timetable/${campus}.json`);
  if (!res.ok) throw new Error(`Failed to fetch timetable for campus ${campus}`);
  const data = await res.json();

  // normalize subject key (add leading dot if missing)
  const key = subject.startsWith(".") ? subject : `.${subject}`;
  const classes = data[key] ?? [];

  // map JSON fields to the shape GroupList expects
  return classes.map((cls: {
    day_time: string;
    group: string;
    mode: string;
    status: string;
    room: string;
    program: string;
    faculty: string;
  }, idx: number) => ({
    no: `${idx + 1}.`,
    day_time: cls.day_time,
    class_code: cls.group,
    mode: cls.mode,
    attempt: cls.status,
    venue: cls.room,
    subject_code: cls.program,
    faculty: cls.faculty,
    subject_name: subject,
  }));
}

export async function getTimetable(matricNumber: string) {
  const res = await fetch(`/api/getTimetable`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matricNumber }),
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
