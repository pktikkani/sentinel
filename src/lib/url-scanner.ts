import "server-only";
import { scanUrls } from "pentest-audit";
import { prisma } from "./prisma";
import type { ScanProfile } from "pentest-audit";

export async function startUrlScan(
  scanId: string,
  targets: string[],
  profile: string
) {
  try {
    await prisma.urlScan.update({
      where: { id: scanId },
      data: { status: "scanning" },
    });

    const result = await scanUrls(targets, profile as ScanProfile);

    const totalChecks = result.results.reduce(
      (sum, r) => sum + r.checks.length,
      0
    );

    await prisma.urlScan.update({
      where: { id: scanId },
      data: {
        status: "completed",
        result: JSON.parse(JSON.stringify(result.results)),
        findings: JSON.parse(JSON.stringify(result.findings)),
        checks: JSON.parse(
          JSON.stringify(result.results.flatMap((r) => r.checks))
        ),
        stats: {
          targetsScanned: result.results.length,
          checksRun: totalChecks,
          findingsFound: result.findings.length,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.urlScan.update({
      where: { id: scanId },
      data: { status: "failed", error: message },
    });
  }
}
