import { IDateFormatter } from "./IDateFormatter.js";

/**
 * Default date formatter implementation
 */
export class DateFormatter implements IDateFormatter {
  format(isoString: string | undefined): string {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  formatFileDate(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
}


