import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow as dateFnsFormatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistanceToNow(date: Date | string | number): string {
  return dateFnsFormatDistanceToNow(new Date(date), { addSuffix: true });
}

export function format(date: Date | string | number, formatStr: string = "PPP"): string {
  const { format: dateFnsFormat } = require("date-fns");
  return dateFnsFormat(new Date(date), formatStr);
}
