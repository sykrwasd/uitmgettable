// lib/api.ts — live fetch from SIMSweb via API routes

export async function getCampus() {
  const res = await fetch("/api/campuses");
  if (!res.ok) throw new Error("Failed to fetch campus list");
  const data: { id: string; text: string }[] = await res.json();
  return data
    .filter((c) => c.id !== "X")
    .map((c) => ({
      id: c.id,
      // API text already includes the id prefix (e.g. "K - UITM KAMPUS ..."), use as-is
      text: c.text,
    }));
}

export async function getFaculty() {
  return [];
}

export async function getSubject(campus: string, faculty: string) {
  if (!campus) return [];
  const params = new URLSearchParams({ campus });
  if (faculty) params.set("faculty", faculty);
  const res = await fetch(`/api/courses?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch courses for ${campus}`);
  const data: { code: string; path: string }[] = await res.json();
  return data.map((c) => ({ course: c.code, href: c.path }));
}

export async function getGroup(campus: string, faculty: string, subject: string) {
  if (!campus || !subject) return [];

  // We need the path — re-fetch courses to find it
  const params = new URLSearchParams({ campus });
  if (faculty) params.set("faculty", faculty);
  const subjectsRes = await fetch(`/api/courses?${params}`);
  if (!subjectsRes.ok) throw new Error("Failed to fetch courses");
  const subjects: { code: string; path: string }[] = await subjectsRes.json();

  const normalised = subject.replace(/^\./, "");
  const found = subjects.find(
    (s) => s.code.replace(/^\./, "") === normalised
  );
  if (!found) return [];

  const groupsRes = await fetch(`/api/groups?path=${encodeURIComponent(found.path)}`);
  if (!groupsRes.ok) throw new Error("Failed to fetch groups");
  const groups: {
    group: string;
    day_time: string;
    mode: string;
    status: string;
    room: string;
    program: string;
    faculty: string;
  }[] = await groupsRes.json();

  return groups.map((cls, idx) => ({
    no: `${idx + 1}.`,
    day_time: cls.day_time,
    class_code: cls.group,
    mode: cls.mode,
    attempt: cls.status,
    venue: cls.room,
    subject_code: subject,
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
