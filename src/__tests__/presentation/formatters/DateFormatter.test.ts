import { DateFormatter } from "../../../presentation/formatters/DateFormatter.js";
import { IDateFormatter } from "../../../presentation/formatters/IDateFormatter.js";

describe("DateFormatter", () => {
  let formatter: IDateFormatter;

  beforeEach(() => {
    formatter = new DateFormatter();
  });

  describe("format", () => {
    it("should format ISO string to display format", () => {
      const isoString = "2024-01-15T10:30:00.000Z";
      const formatted = formatter.format(isoString);

      expect(formatted).toContain("2024");
      expect(formatted).toContain("01");
      expect(formatted).toContain("15");
    });

    it("should return N/A for undefined", () => {
      expect(formatter.format(undefined)).toBe("N/A");
    });

    it("should return N/A for empty string", () => {
      expect(formatter.format("")).toBe("N/A");
    });
  });

  describe("formatFileDate", () => {
    it("should format date to pt-BR format", () => {
      // Use a date that won't have timezone issues
      const date = new Date(2024, 0, 15); // January 15, 2024
      const formatted = formatter.formatFileDate(date);

      // Should be in DD/MM/YYYY format
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(formatted).toContain("2024");
    });
  });
});

