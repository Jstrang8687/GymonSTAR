import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { LegalList, LegalSection, LegalTitle } from "@/components/LegalText";

export const metadata: Metadata = {
  title: `Terms of Service | ${LEGAL.appName}`,
};

export default function TermsPage() {
  return (
    <>
      <LegalTitle updated={LEGAL.effectiveDate}>Terms of Service</LegalTitle>

      <p>
        These terms are the rules for using {LEGAL.appName}, run by {LEGAL.operatorName}. By creating an account or
        using the app you agree to them and to our{" "}
        <Link href="/privacy" className="font-semibold text-amber-400 hover:underline">
          Privacy Policy
        </Link>
        . If you don&apos;t agree, please don&apos;t use the app.
      </p>

      <LegalSection title="Who can use it">
        <p>
          You must be at least {LEGAL.minimumAge}. If you&apos;re under 18, you need a parent or guardian&apos;s
          permission. You&apos;re responsible for keeping your password safe and for what happens under your account.
          Give us accurate information, and keep to one account each.
        </p>
      </LegalSection>

      <LegalSection title="Exercise is at your own risk">
        <p>
          {LEGAL.appName} is a game and a logbook, not medical or coaching advice. The exercise suggestions, coaches,
          and duel challenges are for entertainment and general motivation. Exercise carries a real risk of injury.
          Talk to a doctor before starting or changing a workout routine, work within your own limits, and never push
          through pain to win a duel or hit a streak. You use the app and do any workout at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="Playing fair and being decent">
        <p>You agree not to:</p>
        <LegalList>
          <li>Log workouts you didn&apos;t do, or fake proof, to win duels, gyms, or trophies.</li>
          <li>Fake your location to claim or challenge a gym.</li>
          <li>Harass, threaten, or impersonate anyone, or use a name that is offensive or misleading.</li>
          <li>Upload anything illegal, explicit, hateful, or that you don&apos;t have the right to share.</li>
          <li>Try to break, overload, scrape, or get around the security of the app or other people&apos;s accounts.</li>
        </LegalList>
        <p>
          We can remove content, undo results, suspend, or delete accounts that break these rules, with or without
          notice. If someone is bothering you or you spot cheating, use &ldquo;Report / block&rdquo; on their duel or
          gym card, or email {LEGAL.contactEmail}.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          You keep ownership of what you upload, such as workout logs and proof photos or videos. You give us
          permission to store, process, and display it as needed to run the app, including letting administrators review
          proof for fairness. Only upload things you have the right to share.
        </p>
      </LegalSection>

      <LegalSection title="Monsters, trophies, and other game items">
        <p>
          monSTARs, levels, XP, trophies, gyms, and duel results are virtual and have no cash value. You don&apos;t
          own them and can&apos;t sell or trade them. The app is still being developed, so we may change how the game
          works, rebalance it, or reset game data. We&apos;ll give notice before a reset where we can.
        </p>
      </LegalSection>

      <LegalSection title="Gyms and the real world">
        <p>
          Gym check-in uses your location while you&apos;re physically there. Stay aware of your surroundings and
          follow the rules of any real gym or facility you use. We aren&apos;t affiliated with any gym, and claiming a
          gym in the app gives you no rights at the real place.
        </p>
      </LegalSection>

      <LegalSection title="Notifications and email">
        <p>
          We email you about your account and duels, and send device alerts if you turn them on. You can switch alerts
          off in Settings at any time.
        </p>
      </LegalSection>

      <LegalSection title="The service, and ending your account">
        <p>
          We work to keep the app running but can&apos;t promise it will always be available or error-free. We may
          change, pause, or end features or the whole app. You can stop using it and delete your account any time in
          Settings. We may suspend or end accounts that break these terms.
        </p>
      </LegalSection>

      <LegalSection title="No warranty, and limits on our liability">
        <p>
          The app is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without promises about accuracy or
          fitness for a particular purpose. To the fullest extent the law allows, {LEGAL.operatorName} is not liable
          for indirect or consequential losses, or for injuries or damages arising from your use of the app or your
          workouts. Where the law doesn&apos;t allow a limit, that part simply doesn&apos;t apply to you.
        </p>
      </LegalSection>

      <LegalSection title="Governing law and changes">
        <p>
          These terms are governed by the laws of {LEGAL.governingLaw}. We may update them from time to time. When we
          do, we&apos;ll change the date above and, for significant changes, let you know. Continuing to use the app
          after a change means you accept it.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          {LEGAL.operatorName}, {LEGAL.contactEmail}.
        </p>
      </LegalSection>
    </>
  );
}
