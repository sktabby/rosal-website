export function getCurrentFinancialYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan
  const startYear = month >= 3 ? year : year - 1; // April (index 3) onward = new FY
  const endYear = (startYear + 1) % 100;
  return `FY ${String(startYear).slice(-2)}-${String(endYear).padStart(2, "0")}`;
}
