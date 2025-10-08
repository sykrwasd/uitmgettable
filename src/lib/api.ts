// lib/api.ts
export async function getCampus() {
  const res = await fetch("/api/getCam");
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data;
}

export async function getFaculty() {
  const res = await fetch("/api/getFac");
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data;
}


export async function getSubject(campus:string,faculty:string) {
   const res = await fetch("/api/getSubject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campus, faculty }),
      });
  if (!res.ok) throw new Error("Failed to fetch ");
  const data = await res.json();
  return data;
}


export async function getGroup(campus:string,faculty:string,subject:string) {
  const res = await fetch("/api/getGroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: subject,
          campus,
          faculty,
        }),
      });

 
  return res.json();
}

export async function getTimetable(matricNumber:string) {
 const res = await fetch("/api/getTimetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber
        }),
      });
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data;
}
