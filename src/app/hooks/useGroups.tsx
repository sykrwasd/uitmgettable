"use client";

import { getGroup } from "@/lib/api";
import { useEffect, useState } from "react";


type Group = {
  no: string;
  day_time: string;
  class_code: string;
  mode: string;
  attempt: string;
  venue: string;
  subject_code: string;
  faculty: string;
  subject: string;
  lecturer?: string;
};;

export function useGroups(campus: string, faculty: string, sub:string) {
  const [fetchGroup, setFetchGroup] = useState<Group[]>([]);

 console.log(campus + faculty + sub)
  useEffect(() => {
    if (!campus || !faculty || !sub) return;


    getGroup(campus, faculty,sub)
      .then((data) => setFetchGroup(data))
      .catch((err) => console.error(err))
     
  }, [campus, faculty,sub]);

  return { fetchGroup };
}
