import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of service"
      subtitle="The basics of using Sodoit."
      active="/terms"
    >
      <LegalSection title="Using Sodoit">
        <p>
          By using Sodoit you agree to use the product respectfully and not to
          misuse the platform, other users, or the content shared here.
        </p>
      </LegalSection>

      <LegalSection title="Community content">
        <p>
          Posts, comments, and other content you share are your own. Please keep
          it honest and respectful — we may remove content that breaks these
          terms.
        </p>
      </LegalSection>

      <LegalSection title="Experiences and activities">
        <p>
          Experiences and community posts are provided as-is. Sodoit is not
          responsible for the outcome of any activity you choose to try. Use
          your own judgement, especially for anything physical or higher-risk.
        </p>
      </LegalSection>

      <LegalSection title="Account suspension and removal">
        <p>
          We may suspend or remove accounts that misuse the platform or violate
          these terms. Where possible, we will let you know why.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms as the product evolves. Continued use after
          changes means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms? Reach us at{" "}
          <a
            href="mailto:hello@sodoit.cc"
            className="font-semibold text-accent transition-colors hover:text-accent-dark"
          >
            hello@sodoit.cc
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
