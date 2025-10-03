"use client";
import { useEffect, useState } from "react";
import {  getFaculty } from "@/lib/api";

type Faculty = {
  text: string;
  id: string;
};
export function useFaculty() {
  const [fetchFaculty, setFetchFaculty] = useState<Faculty[]>([]);

  useEffect(() => {
    getFaculty().then((data) => {
      setFetchFaculty(data);
    });
  }, []);

  return { fetchFaculty};
}
