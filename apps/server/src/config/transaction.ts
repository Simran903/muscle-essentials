/**
 * Prisma interactive transactions default maxWait ≈ 2s, which is tight when
 * bcrypt runs inside the callback (magic link verify / refresh). P2028 =
 * "Unable to start a transaction in the given time."
 */
export const interactiveTransactionOptions = {
  maxWait: 15_000,
  timeout: 30_000,
} as const;
