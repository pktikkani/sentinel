import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startScan } from "@/lib/scanner";
import { createScanSchema } from "@/lib/schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const scans = await prisma.scan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(scans);
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { count } = await prisma.scan.deleteMany({
    where: { userId: user.id },
  });

  return NextResponse.json({ deleted: count });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createScanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { repoOwner, repoName, repoUrl, branch, config } = parsed.data;

  const scan = await prisma.scan.create({
    data: {
      userId: user.id,
      repoOwner,
      repoName,
      repoUrl,
      branch,
      profile: config.profile,
      config: JSON.parse(JSON.stringify(config)),
    },
  });

  // Fire and forget — scan runs in background
  startScan(scan.id, repoUrl, branch, session.accessToken, config).catch(
    console.error
  );

  return NextResponse.json(scan, { status: 201 });
}
