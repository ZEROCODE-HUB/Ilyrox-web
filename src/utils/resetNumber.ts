/**
 * Replaces any character that is not a digit (0-9) from the input string.
 * Used to ensure only numeric values are entered in fields like phone numbers or area (m2).
 */
export const resetNumber = (val: string): string => {
  return val.replace(/\D/g, "");
};
