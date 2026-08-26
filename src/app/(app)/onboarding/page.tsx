import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/session-helpers";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (profile.onboarded) redirect("/");

  const coaches = await prisma.coach.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl">
      <OnboardingForm coaches={coaches} />
    </div>
  );
}
