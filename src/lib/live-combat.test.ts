import { describe, expect, it } from "vitest";

import { isPlayerCombatantKind } from "@/lib/live-combat";

describe("isPlayerCombatantKind", () => {
  it("returns true for player kinds", () => {
    expect(isPlayerCombatantKind("CHARACTER")).toBe(true);
    expect(isPlayerCombatantKind("PLAYER")).toBe(true);
    expect(isPlayerCombatantKind("PC")).toBe(true);
  });

  it("is case and whitespace tolerant", () => {
    expect(isPlayerCombatantKind(" character ")).toBe(true);
    expect(isPlayerCombatantKind("player")).toBe(true);
    expect(isPlayerCombatantKind(" pc")).toBe(true);
  });

  it("returns false for non-player kinds and empty values", () => {
    expect(isPlayerCombatantKind("NPC")).toBe(false);
    expect(isPlayerCombatantKind("MONSTER")).toBe(false);
    expect(isPlayerCombatantKind("")).toBe(false);
    expect(isPlayerCombatantKind(undefined)).toBe(false);
    expect(isPlayerCombatantKind(null)).toBe(false);
  });
});
