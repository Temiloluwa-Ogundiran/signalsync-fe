import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/features/legal/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SignalSync handles personal and trading information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument title="Privacy Policy" updatedAt="August 13, 2026">
      <LegalSection title="Information we handle">
        <p>
          SignalSync handles the information needed to create and secure your
          account, connect supported trading accounts, deliver copy-trading
          workflows, and provide journal and analytics features.
        </p>
      </LegalSection>

      <LegalSection title="Trading data">
        <p>
          Trading credentials and account data are used to provide the requested
          service. We do not sell your trading data or use it to provide
          investment advice.
        </p>
      </LegalSection>

      <LegalSection title="Security and retention">
        <p>
          We use access controls, encryption, and service monitoring appropriate
          to the information we process. Retention depends on account status,
          legal requirements, and operational needs.
        </p>
      </LegalSection>

      <LegalSection title="Choices and requests">
        <p>
          You may request access, correction, or deletion of personal
          information by contacting support through the app.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
