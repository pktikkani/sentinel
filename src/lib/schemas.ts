import { z } from "zod";

export const scanConfigSchema = z.object({
  // Core
  profile: z.enum(["passive", "active", "exploit"]).default("active"),
  codeAnalysis: z.enum(["off", "focused", "full"]).default("focused"),
  severity: z.enum(["critical", "warning", "suggestion"]).default("suggestion"),

  // SCA & Dependencies
  sca: z.boolean().default(true),
  licenseCheck: z.boolean().default(false),
  licensePolicy: z.enum(["commercial", "open-source", "permissive-only"]).default("commercial"),

  // Compliance
  compliance: z.array(z.string()).default([]),

  // LLM
  multiPass: z.boolean().default(true),
  maxPass2Findings: z.number().int().min(1).max(100).default(30),

  // URL scanning
  urlScan: z.boolean().default(false),
  targets: z.array(z.string()).default([]),

  // External tools
  runExternalTools: z.boolean().default(false),
  selectedTools: z.array(z.string()).default([]),
  toolTimeout: z.number().int().min(10).max(600).default(120),
});

export const createScanSchema = z.object({
  repoOwner: z
    .string()
    .min(1, "Repository owner is required")
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Invalid owner format"),
  repoName: z
    .string()
    .min(1, "Repository name is required")
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Invalid repo name format"),
  repoUrl: z
    .string()
    .url("Invalid repository URL")
    .startsWith("https://github.com/", "Only GitHub URLs are supported"),
  branch: z
    .string()
    .max(250)
    .regex(/^[a-zA-Z0-9_./-]+$/, "Invalid branch name")
    .default("main"),
  config: scanConfigSchema.optional().default({
    profile: "active",
    codeAnalysis: "focused",
    severity: "suggestion",
    sca: true,
    licenseCheck: false,
    licensePolicy: "commercial",
    compliance: [],
    multiPass: true,
    maxPass2Findings: 30,
    urlScan: false,
    targets: [],
    runExternalTools: false,
    selectedTools: [],
    toolTimeout: 120,
  }),
});

export type CreateScanInput = z.infer<typeof createScanSchema>;
export type ScanConfig = z.infer<typeof scanConfigSchema>;
