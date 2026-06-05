import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// lib/utils.ts
export function parseCampus(input: string) {
  if (!input) return { campus: "", selangor: false };
  const campus = input.split("-")[0]?.trim() ?? "";
  const selangor = campus === "B";
  return { campus, selangor };
}
