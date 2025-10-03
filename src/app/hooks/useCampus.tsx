"use client";
import { useEffect, useState } from "react";
import { getCampus } from "@/lib/api";

type Campus = {
  id: string;
  text: string;
};

export function useCampus() {
  const [fetchCampus, setFetchCampus] = useState<Campus[]>([]);
  const [loadingCampus, setLoadingCampus] = useState(true);

  useEffect(() => {
    getCampus().then((data) => {
      setFetchCampus(data);
      setLoadingCampus(false);
    });
  }, []);

  return { fetchCampus, loadingCampus };
}
