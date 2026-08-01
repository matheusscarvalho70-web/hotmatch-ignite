/** Deterministic demo profile UUIDs, seeded in the DB migration. */
export const DEMO_IDS = {
  /** Bianca — female creator (logged-in female demo user) */
  female: "00000000-0000-0000-0000-000000000001",
  /** Carlos — male buyer (logged-in male demo user) */
  male: "00000000-0000-0000-0000-000000000002",
  /** Other profiles available in the feed/chat */
  marina: "00000000-0000-0000-0000-000000000003",
  helena: "00000000-0000-0000-0000-000000000004",
  duda: "00000000-0000-0000-0000-000000000005",
} as const;

/** Map a route chatId param to a DB profile UUID. */
export function chatIdToProfileId(chatId: string): string {
  const map: Record<string, string> = {
    u1: DEMO_IDS.female,
    u2: DEMO_IDS.marina,
    u3: DEMO_IDS.helena,
    u4: DEMO_IDS.duda,
    [DEMO_IDS.female]: DEMO_IDS.female,
    [DEMO_IDS.marina]: DEMO_IDS.marina,
    [DEMO_IDS.helena]: DEMO_IDS.helena,
    [DEMO_IDS.duda]: DEMO_IDS.duda,
  };
  return map[chatId] ?? DEMO_IDS.female;
}
