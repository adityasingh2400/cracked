import { describe, expect, it } from "vitest";
import { buildCrackedResult } from "@/lib/result-scoring";
import type { ExtractedSignals } from "@/lib/types";

const youngFounderStack: ExtractedSignals = {
  schools: [],
  companies: [{ name: "Cean", title: "Co-Founder" }],
  awards: [{ name: "4x Hackathon Winner" }],
  publications: [{ venue: "IEEE", role: "co" }],
  funding: [{ company: "Cean", round: "Seed" }],
  open_source: [],
  online: [],
  raw_text: "Co-Founder, Cean (Seed). UCSD CSE research. 4x Hackathon Winner in AI. IEEE publication.",
};

describe("result scoring evidence floors", () => {
  it("does not under-score an 18-year-old founder with funding, research, and repeated hackathon wins", () => {
    const result = buildCrackedResult({
      id: "young-founder",
      name: "Pavan Kumar",
      signals: youngFounderStack,
      modelUsed: "claude",
      userAge: 18,
    });

    expect(result.primaryFamily).toBe("founder");
    expect(result.tier).toBe("S");
    expect(result.tierStars).toBe(3);
    expect(result.families?.find((family) => family.family === "founder")?.matched)
      .toContain("founder_young_signal_stack");
  });
});
