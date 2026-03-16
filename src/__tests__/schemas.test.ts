import { describe, it, expect } from "vitest";
import { createScanSchema, scanConfigSchema } from "@/lib/schemas";

describe("scanConfigSchema", () => {
  it("accepts valid config", () => {
    const result = scanConfigSchema.safeParse({
      profile: "active",
      codeAnalysis: "focused",
      sca: true,
      licenseCheck: false,
      compliance: ["soc2"],
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for empty object", () => {
    const result = scanConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.profile).toBe("active");
      expect(result.data.codeAnalysis).toBe("focused");
      expect(result.data.severity).toBe("suggestion");
      expect(result.data.sca).toBe(true);
      expect(result.data.licenseCheck).toBe(false);
      expect(result.data.licensePolicy).toBe("commercial");
      expect(result.data.compliance).toEqual([]);
      expect(result.data.multiPass).toBe(true);
      expect(result.data.maxPass2Findings).toBe(30);
      expect(result.data.urlScan).toBe(false);
      expect(result.data.targets).toEqual([]);
      expect(result.data.runExternalTools).toBe(false);
      expect(result.data.selectedTools).toEqual([]);
      expect(result.data.toolTimeout).toBe(120);
    }
  });

  it("rejects invalid profile", () => {
    const result = scanConfigSchema.safeParse({ profile: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid codeAnalysis", () => {
    const result = scanConfigSchema.safeParse({ codeAnalysis: "deep" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid severity", () => {
    const result = scanConfigSchema.safeParse({ severity: "high" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid licensePolicy", () => {
    const result = scanConfigSchema.safeParse({ licensePolicy: "copyleft" });
    expect(result.success).toBe(false);
  });

  it("rejects maxPass2Findings out of range", () => {
    expect(scanConfigSchema.safeParse({ maxPass2Findings: 0 }).success).toBe(false);
    expect(scanConfigSchema.safeParse({ maxPass2Findings: 101 }).success).toBe(false);
    expect(scanConfigSchema.safeParse({ maxPass2Findings: 3.5 }).success).toBe(false);
  });

  it("accepts all valid severity levels", () => {
    for (const sev of ["critical", "warning", "suggestion"]) {
      expect(scanConfigSchema.safeParse({ severity: sev }).success).toBe(true);
    }
  });

  it("accepts all valid license policies", () => {
    for (const pol of ["commercial", "open-source", "permissive-only"]) {
      expect(scanConfigSchema.safeParse({ licensePolicy: pol }).success).toBe(true);
    }
  });

  it("accepts full config with all options", () => {
    const result = scanConfigSchema.safeParse({
      profile: "exploit",
      codeAnalysis: "full",
      severity: "critical",
      sca: false,
      licenseCheck: true,
      licensePolicy: "permissive-only",
      compliance: ["soc2", "hipaa", "gdpr"],
      multiPass: false,
      maxPass2Findings: 50,
      urlScan: true,
      targets: ["https://example.com"],
      runExternalTools: true,
      selectedTools: ["nuclei", "nmap", "gitleaks"],
      toolTimeout: 300,
    });
    expect(result.success).toBe(true);
  });

  it("rejects toolTimeout out of range", () => {
    expect(scanConfigSchema.safeParse({ toolTimeout: 5 }).success).toBe(false);
    expect(scanConfigSchema.safeParse({ toolTimeout: 700 }).success).toBe(false);
  });
});

describe("createScanSchema", () => {
  const validInput = {
    repoOwner: "octocat",
    repoName: "hello-world",
    repoUrl: "https://github.com/octocat/hello-world",
    branch: "main",
    config: { profile: "active" as const },
  };

  it("accepts valid input", () => {
    const result = createScanSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects empty repoOwner", () => {
    const result = createScanSchema.safeParse({
      ...validInput,
      repoOwner: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid repoOwner characters", () => {
    const result = createScanSchema.safeParse({
      ...validInput,
      repoOwner: "user; rm -rf /",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid repoName characters", () => {
    const result = createScanSchema.safeParse({
      ...validInput,
      repoName: "../../../etc/passwd",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-GitHub URLs", () => {
    const result = createScanSchema.safeParse({
      ...validInput,
      repoUrl: "https://gitlab.com/user/repo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid branch names", () => {
    const result = createScanSchema.safeParse({
      ...validInput,
      branch: "branch; malicious",
    });
    expect(result.success).toBe(false);
  });

  it("applies default branch when not provided", () => {
    const { branch: _, ...noBranch } = validInput;
    const result = createScanSchema.safeParse(noBranch);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.branch).toBe("main");
    }
  });

  it("rejects completely missing fields", () => {
    const result = createScanSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("provides structured error messages", () => {
    const result = createScanSchema.safeParse({
      repoOwner: "",
      repoName: "",
      repoUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      expect(flat.repoOwner).toBeDefined();
      expect(flat.repoName).toBeDefined();
      expect(flat.repoUrl).toBeDefined();
    }
  });
});
