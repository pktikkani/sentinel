import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startUrlScan } from "@/lib/url-scanner";

const createUrlScanSchema = z.object({
  targets: z
    .array(z.string().url("Each target must be a valid URL"))
    .min(1, "At least one target URL is required")
    .max(10, "Maximum 10 targets per scan"),
  profile: z.enum(["passive", "active", "exploit"]).default("active"),
});

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

  const scans = await prisma.urlScan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(scans);
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const parsed = createUrlScanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { targets, profile } = parsed.data;

  const urlScan = await prisma.urlScan.create({
    data: {
      userId: user.id,
      targets,
      profile,
    },
  });

  // Fire and forget
  startUrlScan(urlScan.id, targets, profile).catch(console.error);

  return NextResponse.json(urlScan, { status: 201 });
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

  const { count } = await prisma.urlScan.deleteMany({
    where: { userId: user.id },
  });

  return NextResponse.json({ deleted: count });
}
