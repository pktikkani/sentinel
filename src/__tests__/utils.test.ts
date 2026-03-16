import { describe, it, expect } from "vitest";
import {
  cn,
  timeAgo,
  scoreColor,
  scoreBg,
  severityColor,
  statusColor,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent dates", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(timeAgo(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo)).toBe("3d ago");
  });

  it("accepts string dates", () => {
    const result = timeAgo(new Date(Date.now() - 60 * 1000).toISOString());
    expect(result).toBe("1m ago");
  });
});

describe("scoreColor", () => {
  it("returns green for high scores", () => {
    expect(scoreColor(85)).toBe("text-emerald-400");
  });

  it("returns yellow for medium scores", () => {
    expect(scoreColor(65)).toBe("text-yellow-400");
  });

  it("returns orange for low-medium scores", () => {
    expect(scoreColor(45)).toBe("text-orange-400");
  });

  it("returns red for low scores", () => {
    expect(scoreColor(20)).toBe("text-red-400");
  });

  it("handles boundary at 80", () => {
    expect(scoreColor(80)).toBe("text-emerald-400");
  });

  it("handles boundary at 60", () => {
    expect(scoreColor(60)).toBe("text-yellow-400");
  });

  it("handles boundary at 40", () => {
    expect(scoreColor(40)).toBe("text-orange-400");
  });
});

describe("scoreBg", () => {
  it("returns green bg for high scores", () => {
    expect(scoreBg(90)).toContain("bg-emerald");
  });

  it("returns red bg for low scores", () => {
    expect(scoreBg(10)).toContain("bg-red");
  });
});

describe("severityColor", () => {
  it("returns correct classes for critical", () => {
    expect(severityColor("critical")).toContain("text-red-400");
  });

  it("returns correct classes for warning", () => {
    expect(severityColor("warning")).toContain("text-amber-400");
  });

  it("returns correct classes for suggestion", () => {
    expect(severityColor("suggestion")).toContain("text-blue-400");
  });

  it("returns correct classes for good", () => {
    expect(severityColor("good")).toContain("text-emerald-400");
  });

  it("returns fallback for unknown severity", () => {
    expect(severityColor("unknown")).toContain("text-zinc-400");
  });
});

describe("statusColor", () => {
  it("returns green for completed", () => {
    expect(statusColor("completed")).toContain("text-emerald-400");
  });

  it("returns blue for scanning", () => {
    expect(statusColor("scanning")).toContain("text-blue-400");
  });

  it("returns blue for cloning", () => {
    expect(statusColor("cloning")).toContain("text-blue-400");
  });

  it("returns red for failed", () => {
    expect(statusColor("failed")).toContain("text-red-400");
  });

  it("returns zinc for queued", () => {
    expect(statusColor("queued")).toContain("text-zinc-400");
  });
});
