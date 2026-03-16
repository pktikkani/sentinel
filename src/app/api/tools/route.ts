import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getToolCatalog, getToolsForProfile } from "pentest-audit";
import { spawnSync } from "child_process";

function isInstalled(binary: string): boolean {
  return spawnSync("which", [binary], { stdio: "pipe" }).status === 0;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profile = searchParams.get("profile") || "active";

  const catalog = getToolCatalog();
  const profileTools = getToolsForProfile(
    profile as "passive" | "active" | "exploit"
  );

  const tools = catalog.map((tool) => ({
    ...tool,
    installed: isInstalled(tool.binary),
    inProfile: profileTools.includes(tool.id),
  }));

  return NextResponse.json(tools);
}
