import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy policy"
      subtitle="How Sodoit handles your data."
      active="/privacy"
    >
      <LegalSection title="Information we collect">
        <p>
          When you create a Sodoit account, we collect your email address and
          the username and profile information you choose to add, such as a bio
          or avatar.
        </p>
        <p>
          As you use Sodoit, we store the experiences you save or complete,
          along with any posts, comments, or other content you create.
        </p>
      </LegalSection>

      <LegalSection title="How we use your information">
        <p>
          Your information is used to run your account, show your public
          profile, track your saved and completed experiences, and display your
          achievements and community posts.
        </p>
        <p>We do not sell your data to third parties.</p>
      </LegalSection>

      <LegalSection title="Service providers">
        <p>
          Sodoit runs on Supabase, which stores our database and handles
          authentication and file storage, and Vercel, which hosts the
          application. Both process data on our behalf solely to operate the
          product.
        </p>
      </LegalSection>

      <LegalSection title="Your data">
        <p>
          You can update your profile information at any time from your account
          settings. To request a copy or deletion of your data, contact us and
          we will process your request.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy? Reach us at{" "}
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
