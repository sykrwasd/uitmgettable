import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// lib/utils.ts
export function parseCampus(input: string) {
  if (!input) return { campus: "", selangor: false };

  if (input.includes("( Please Select a Faculty )") || input.includes("selangor")) {
    return { campus: "selangor", selangor: true };
  } else if (input.startsWith("SELANGOR")) {
    return { campus: input.split("-")[1]?.trim() ?? "", selangor: false };
  } else {
    return { campus: input.split("-")[0]?.trim() ?? "", selangor: false };
  }
}
