import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { LegalList, LegalSection, LegalTitle } from "@/components/LegalText";

export const metadata: Metadata = {
  title: `Privacy Policy | ${LEGAL.appName}`,
};

export default function PrivacyPage() {
  return (
    <>
      <LegalTitle updated={LEGAL.effectiveDate}>Privacy Policy</LegalTitle>

      <p>
        {LEGAL.appName} (&ldquo;the app&rdquo;, &ldquo;we&rdquo;) is a workout tracker where each muscle group is a
        collectible creature. It is run by {LEGAL.operatorName}. This policy explains what information the app
        collects, why, who else touches it, and the choices you have. We wrote it to match what the app really does
        today. Questions? Email {LEGAL.contactEmail}.
      </p>

      <LegalSection title="What we collect">
        <LegalList>
          <li>
            <strong className="text-white">Account details:</strong> your name and email address, and your password.
            Passwords are stored only as a one-way hash, so we can&apos;t read them.
          </li>
          <li>
            <strong className="text-white">Training data you enter:</strong> workouts (exercises, sets, reps, weights,
            durations, distances), the muscle groups you train, your monSTARs and their levels and XP, login streaks,
            training programs, saved workout templates, trophies, and your duel history.
          </li>
          <li>
            <strong className="text-white">Workout proof (optional):</strong> photos or videos you choose to upload
            to back up a workout. Only you and the app&apos;s administrators can view them.
          </li>
          <li>
            <strong className="text-white">Location, only when you check in at a gym:</strong> when you tap
            &ldquo;Check in here&rdquo;, the app reads your device&apos;s location once. If the spot is new, those
            coordinates are saved as that gym&apos;s location, shown alongside the gym&apos;s name and its
            champion&apos;s name. The app does not track your location in the background or at any other time. If you
            deny the permission, everything except gym check-in still works.
          </li>
          <li>
            <strong className="text-white">Notification settings:</strong> if you turn on duel notifications, we
            store a push token for that device (an address and encryption keys supplied by your browser) so we can send
            you alerts. You can turn this off in Settings at any time.
          </li>
          <li>
            <strong className="text-white">Saved on your device:</strong> a sign-in cookie that keeps you logged in,
            plus small items in your browser&apos;s storage, such as an unfinished workout draft and which
            &ldquo;you&apos;ve been challenged&rdquo; notices you&apos;ve already dismissed.
          </li>
        </LegalList>
        <p>
          We do not use advertising or analytics trackers, and we do not collect payment information (the app is
          free).
        </p>
      </LegalSection>

      <LegalSection title="What other trainers can see">
        <p>
          Other trainers can find you by searching your name. They can challenge you to a duel, and they can see your
          name, the muscle type fought over, and the scores in duels you share with them. You can report or block any
          trainer from a duel or gym card, and manage blocked trainers in Settings. Gym screens show the gym&apos;s name and its current champion&apos;s name. Your
          email address, password, workouts, and proof uploads are not shown to other trainers.
        </p>
      </LegalSection>

      <LegalSection title="How we use your information">
        <LegalList>
          <li>To run the app: track your workouts, level your monSTARs, score duels, and award trophies.</li>
          <li>
            To email you about your account: verification, password resets, a welcome note, duel challenges, and
            account deletion confirmation.
          </li>
          <li>To send duel alerts to your device if you opted in.</li>
          <li>To keep duels fair, including reviewing workout proof when needed, and to protect the app from abuse.</li>
        </LegalList>
        <p>We do not sell your personal information and we do not use it for advertising.</p>
      </LegalSection>

      <LegalSection title="Who else handles your data">
        <p>We use a few service providers to run the app. They process data only to provide their service to us:</p>
        <LegalList>
          <li>Render, which hosts the app and stores uploaded proof files.</li>
          <li>Supabase, which hosts the database (in the United States).</li>
          <li>Resend, which delivers our emails.</li>
          <li>
            The push services run by browser and phone makers (such as Apple, Google, and Mozilla), which carry
            notifications to your device.
          </li>
        </LegalList>
        <p>We may also disclose information if the law requires it or to protect people&apos;s safety.</p>
      </LegalSection>

      <LegalSection title="How long we keep it, and deleting it">
        <p>
          We keep your data while your account exists. You can delete your account yourself in Settings, under
          &ldquo;Delete my account&rdquo;. That permanently removes your account, training data, and uploaded proof
          files, and we email you a confirmation. Copies held in our providers&apos; routine backups may take a short
          while to age out.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <LegalList>
          <li>Delete your account and data any time, in Settings.</li>
          <li>Turn duel notifications on or off, in Settings, or in your browser or phone settings.</li>
          <li>Decline location access. Only gym check-in needs it.</li>
          <li>Skip proof uploads. They are optional.</li>
          <li>
            Email {LEGAL.contactEmail} to ask for a copy of your data, to correct it, or with any privacy question.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Connections to the app are encrypted, passwords are hashed, and the database blocks direct public access. No
          system is perfectly secure, so we can&apos;t promise absolute protection, but we take reasonable care.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The app is not for children under {LEGAL.minimumAge}. We don&apos;t knowingly collect information from them.
          If you believe a child has signed up, email {LEGAL.contactEmail} and we will delete the account.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If we change this policy in a meaningful way we&apos;ll update the date above and, where it makes sense, tell
          you in the app or by email.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          {LEGAL.operatorName}, {LEGAL.contactEmail}. See also our{" "}
          <Link href="/terms" className="font-semibold text-amber-400 hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </>
  );
}
