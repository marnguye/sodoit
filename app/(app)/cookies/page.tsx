import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookies"
      subtitle="What Sodoit stores in your browser."
      active="/cookies"
    >
      <LegalSection title="Essential cookies">
        <p>
          Sodoit uses only essential cookies required to keep you signed in and
          remember your session. Without these, sign-in would not work.
        </p>
      </LegalSection>

      <LegalSection title="Analytics and advertising">
        <p>
          We do not currently use advertising or marketing cookies, and we do
          not run analytics tracking that requires consent.
        </p>
      </LegalSection>

      <LegalSection title="Future changes">
        <p>
          If we add analytics or advertising in the future, we will update this
          policy and provide consent controls before any non-essential cookies
          are set.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
