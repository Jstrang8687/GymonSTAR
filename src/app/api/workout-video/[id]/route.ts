import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import { readWorkoutVideo } from "@/lib/videoStorage";

export async function GET(_req: Request, { params }: RouteContext<"/api/workout-video/[id]">) {
  const userId = await getUserId();
  const { id } = await params;

  const log = await prisma.workoutLog.findUnique({ where: { id } });
  if (!log || log.userId !== userId || !log.videoFilename) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readWorkoutVideo(log.videoFilename);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": log.videoMimeType ?? "video/mp4",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
