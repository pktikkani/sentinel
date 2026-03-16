import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchRepoBranches } from "@/lib/github";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;

  try {
    const branches = await fetchRepoBranches(session.accessToken, owner, repo);
    return NextResponse.json(branches);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch branches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
