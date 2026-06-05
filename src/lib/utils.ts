import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// lib/utils.ts
export function parseCampus(input: string) {
  if (!input) return { campus: "", selangor: false };
  // format is now "A4 - TAPAH" — just grab the ID before the dash
  const campus = input.split("-")[0]?.trim() ?? "";
  return { campus, selangor: false };
}
