/** Prisma Decimal and similar objects expose toString(). */
export function serializeDecimal(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && value !== null && "toString" in value) {
    return String((value as { toString(): string }).toString());
  }
  return String(value);
}
