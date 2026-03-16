import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchUserRepos } from "@/lib/github";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("per_page") || "30", 10);

  try {
    const repos = await fetchUserRepos(session.accessToken, page, perPage);
    return NextResponse.json(repos);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch repos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
