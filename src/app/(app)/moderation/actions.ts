"use server";

import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/session-helpers";
import { blockUser, reportUser, unblockUser } from "@/lib/moderation";
import { REPORT_REASON_LABEL } from "@/lib/reportReasons";
import type { ReportReason } from "@prisma/client";

export interface ModerationState {
  ok: boolean;
  message: string;
}

function refresh() {
  revalidatePath("/battle");
  revalidatePath("/settings");
}

export async function blockTrainer(targetId: string): Promise<ModerationState> {
  const userId = await getUserId();
  try {
    await blockUser(userId, targetId);
    refresh();
    return { ok: true, message: "Blocked. You won't see or be challenged by each other." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Couldn't block that trainer." };
  }
}

export async function unblockTrainer(targetId: string): Promise<ModerationState> {
  const userId = await getUserId();
  await unblockUser(userId, targetId);
  refresh();
  return { ok: true, message: "Unblocked." };
}

export async function reportTrainer(targetId: string, reason: string, note: string): Promise<ModerationState> {
  const userId = await getUserId();
  if (!(reason in REPORT_REASON_LABEL)) {
    return { ok: false, message: "Pick a reason for the report." };
  }
  try {
    await reportUser(userId, targetId, reason as ReportReason, note);
    return { ok: true, message: "Thanks -- we'll review it." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Couldn't send that report." };
  }
}
