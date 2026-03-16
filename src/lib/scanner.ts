import "server-only";
import { mkdir, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";
import { scan } from "pentest-audit";
import { prisma } from "./prisma";
import type { ScanConfig } from "./schemas";

const SCAN_DIR = join(tmpdir(), "sentinel-scans");

export async function startScan(
  scanId: string,
  repoUrl: string,
  branch: string,
  accessToken: string,
  config: ScanConfig
) {
  try {
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "cloning" },
    });

    // Ensure scan dir exists, then clone repo
    await mkdir(SCAN_DIR, { recursive: true });
    const workDir = await mkdtemp(join(SCAN_DIR, "repo-"));
    const cloneUrl = repoUrl.replace(
      "https://github.com/",
      `https://x-access-token:${accessToken}@github.com/`
    );

    await gitClone(cloneUrl, branch, workDir);

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "scanning" },
    });

    // Run scan directly via library API — no subprocess needed
    const report = await scan(workDir, {
      profile: config.profile,
      codeAnalysis: config.codeAnalysis,
      severity: config.severity,
      sca: config.sca,
      licenseCheck: config.licenseCheck,
      licensePolicy: config.licensePolicy,
      compliance: config.compliance,
      multiPass: config.multiPass,
      maxPass2Findings: config.maxPass2Findings,
      urlScan: config.urlScan,
      targets: config.targets,
      runExternalTools: config.runExternalTools,
      selectedTools: config.selectedTools,
      toolTimeout: config.toolTimeout,
      onProgress: (phase, detail) => {
        console.log(`[sentinel:${scanId.slice(0, 8)}] ${phase}: ${detail ?? ""}`);
      },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "completed",
        result: JSON.parse(JSON.stringify(report)),
        score: report.summary?.score ?? null,
        findings: JSON.parse(JSON.stringify(report.findings ?? [])),
        summary: JSON.parse(JSON.stringify(report.summary ?? {})),
      },
    });

    // Cleanup
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "failed", error: message },
    });
  }
}

function gitClone(url: string, branch: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "git",
      ["clone", "--depth", "1", "--branch", branch, url, dest],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    let stderr = "";
    child.stderr.on("data", (data) => (stderr += data));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`git clone failed (code ${code}): ${stderr}`));
    });
    child.on("error", reject);
  });
}
