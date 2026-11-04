import "server-only";
import { prisma } from "@/lib/prisma";
import { sendReportEmail } from "@/lib/email";
import { REPORT_REASON_LABEL } from "@/lib/reportReasons";
import type { ReportReason } from "@prisma/client";

const MAX_NOTE_LENGTH = 500;

// Everyone this user has blocked or been blocked by. Blocks are mutual in
// effect -- neither side can find or challenge the other -- so callers
// don't need to care who blocked whom.
export async function blockedEitherWayIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.userBlock.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<string>();
  for (const row of rows) ids.add(row.blockerId === userId ? row.blockedId : row.blockerId);
  return ids;
}

export async function isBlockedEitherWay(a: string, b: string): Promise<boolean> {
  const hit = await prisma.userBlock.findFirst({
    where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] },
    select: { id: true },
  });
  return hit !== null;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (blockerId === blockedId) throw new Error("You can't block yourself.");
  const target = await prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
  if (!target) throw new Error("That trainer doesn't exist.");

  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    create: { blockerId, blockedId },
    update: {},
  });
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  await prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
}

export interface BlockedTrainer {
  userId: string;
  name: string;
}

// Only the people this user blocked themselves -- someone who blocked you
// isn't something you can see or undo.
export async function listBlockedTrainers(userId: string): Promise<BlockedTrainer[]> {
  const rows = await prisma.userBlock.findMany({
    where: { blockerId: userId },
    orderBy: { createdAt: "desc" },
    select: { blocked: { select: { id: true, name: true } } },
  });
  return rows.map((r) => ({ userId: r.blocked.id, name: r.blocked.name }));
}

export async function reportUser(
  reporterId: string,
  reportedId: string,
  reason: ReportReason,
  note: string
): Promise<void> {
  if (reporterId === reportedId) throw new Error("You can't report yourself.");

  const [reporter, reported] = await Promise.all([
    prisma.user.findUnique({ where: { id: reporterId }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: reportedId }, select: { name: true } }),
  ]);
  if (!reporter || !reported) throw new Error("That trainer doesn't exist.");

  const alreadyOpen = await prisma.userReport.findFirst({
    where: { reporterId, reportedId, status: "OPEN" },
    select: { id: true },
  });
  if (alreadyOpen) throw new Error(`You've already reported ${reported.name} -- we're reviewing it.`);

  const cleanNote = note.trim().slice(0, MAX_NOTE_LENGTH);
  await prisma.userReport.create({
    data: { reporterId, reportedId, reason, note: cleanNote || null },
  });

  await sendReportEmail(reporter.name, reported.name, REPORT_REASON_LABEL[reason], cleanNote);
}

export interface OpenReport {
  id: string;
  reportedId: string;
  reportedName: string;
  reporterName: string;
  reason: ReportReason;
  note: string | null;
  createdAt: Date;
}

export async function listOpenReports(): Promise<OpenReport[]> {
  const rows = await prisma.userReport.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "asc" },
    include: { reporter: { select: { name: true } }, reported: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    reportedId: r.reportedId,
    reportedName: r.reported.name,
    reporterName: r.reporter.name,
    reason: r.reason,
    note: r.note,
    createdAt: r.createdAt,
  }));
}
