/**
 * Interface for date formatting
 */
export interface IDateFormatter {
  /**
   * Format ISO date string to display format
   * @param isoString - ISO date string or undefined
   * @returns Formatted date string or "N/A"
   */
  format(isoString: string | undefined): string;

  /**
   * Format file date to display format
   * @param date - Date object
   * @returns Formatted date string
   */
  formatFileDate(date: Date): string;
}


