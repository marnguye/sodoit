import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalSection } from "@/components/legal/LegalSection";

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact"
      subtitle="We'd like to hear from you."
      active="/contact"
    >
      <LegalSection title="Get in touch">
        <p>
          Questions, feedback, or issues with the product? Reach out and
          we&apos;ll get back to you.
        </p>
        <a
          href="mailto:hello@sodoit.cc"
          className="w-fit font-semibold text-accent transition-colors hover:text-accent-dark"
        >
          hello@sodoit.cc
        </a>
      </LegalSection>

      <LegalSection title="Account and privacy requests">
        <p>
          For account access, data export, or deletion requests, email us at
          the same address and mention what you need — we&apos;ll follow up
          directly.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
