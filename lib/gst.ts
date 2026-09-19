// GST state codes — the first two digits of a GSTIN.
const GST_STATES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand",
  "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim",
  "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura", "17": "Meghalaya",
  "18": "Assam", "19": "West Bengal", "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh",
  "24": "Gujarat", "26": "Dadra & Nagar Haveli and Daman & Diu", "27": "Maharashtra", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman & Nicobar Islands",
  "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh", "97": "Other Territory",
};

/** "Maharashtra" for a GSTIN starting 27…, or "" if unknown. */
export function stateFromGstin(gstin?: string | null): string {
  return GST_STATES[(gstin ?? "").slice(0, 2)] ?? "";
}

/** Same state (CGST + SGST) when both GSTINs share a state code; null if either is missing. */
export function isSameState(a?: string | null, b?: string | null): boolean | null {
  const x = (a ?? "").slice(0, 2);
  const y = (b ?? "").slice(0, 2);
  if (x.length < 2 || y.length < 2) return null;
  return x === y;
}
