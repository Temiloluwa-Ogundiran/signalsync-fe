import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/features/legal/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using SignalSync's trading journal and copy-trading tools.",
};

export default function TermsOfServicePage() {
  return (
    <LegalDocument title="Terms of Service" updatedAt="August 13, 2026">
      <LegalSection title="Acceptance of these terms">
        <p>
          By creating an account or using SignalSync, you agree to these Terms
          of Service and our Privacy Policy. Do not use the service if you do
          not agree with them.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          You must provide accurate account information, keep your credentials
          confidential, and promptly tell us through the app if you believe your
          account has been accessed without permission. You are responsible for
          activity carried out through your account.
        </p>
      </LegalSection>

      <LegalSection title="What SignalSync provides">
        <p>
          SignalSync provides trading-journal, analytics, account-connection,
          and copy-trading tools. It is not a broker, investment adviser, fund
          manager, or provider of investment recommendations. The service does
          not guarantee a trade, price, fill, profit, or trading outcome.
        </p>
      </LegalSection>

      <LegalSection title="Connected trading accounts and copy trading">
        <p>
          You may connect only accounts you own or are authorised to manage. For
          journal imports, use the read-only access requested by the connection
          flow. Copy trading can place instructions on an account only after you
          choose a source, destination account, and settings.
        </p>
        <p>
          You remain responsible for your chosen routes, trade size, risk limits,
          account permissions, and open positions. Review every route before
          activation and pause or stop copying when you no longer want automated
          instructions sent to your broker.
        </p>
      </LegalSection>

      <LegalSection title="Trading risk">
        <p>
          Trading financial markets involves substantial risk and can result in
          losses, including losses exceeding planned amounts where market
          conditions, leverage, or broker execution allow it. Signals, journal
          analytics, and copy-trading activity are tools, not financial advice.
          You make all trading decisions at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="Subscriptions and payments">
        <p>
          Some features require a paid subscription. Applicable prices, currency,
          billing interval, and any taxes are shown before checkout. Where a plan
          renews automatically, you authorise the payment method you provide to
          be charged until you cancel through the subscription settings.
        </p>
        <p>
          Cancellation stops future renewals and does not normally undo access
          already provided for a paid period. Any refund required by applicable
          law will be honoured.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          Do not misuse the service, interfere with its security or availability,
          access another person&apos;s data or account without permission, use the
          platform for unlawful activity, or attempt to reverse engineer or
          bypass product limits and controls.
        </p>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <p>
          We work to keep the service available and accurate, but integrations,
          brokers, markets, third-party providers, and networks can fail or
          change. We may modify, suspend, or discontinue a feature when needed
          for security, reliability, legal compliance, or product improvement.
        </p>
      </LegalSection>

      <LegalSection title="Suspension and termination">
        <p>
          We may suspend or close an account where reasonably necessary to
          protect users, the platform, or third parties, or where these terms are
          breached. You may stop using the service and request account deletion
          through support in the app.
        </p>
      </LegalSection>

      <LegalSection title="Privacy">
        <p>
          Our handling of personal and trading information is described in the
          Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          To the extent permitted by applicable law, SignalSync is not liable
          for trading losses, missed signals, broker execution, market movement,
          or third-party service failures. Nothing in these terms limits rights
          or liability that cannot legally be limited.
        </p>
      </LegalSection>

      <LegalSection title="Changes and support">
        <p>
          We may update these terms when the service or legal requirements
          change. We will post the updated version here with a revised date.
          For questions or requests, contact support through the app.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
