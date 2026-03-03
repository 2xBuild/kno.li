import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Privacy & Terms · kno.li",
  description:
    "Privacy policy and terms and conditions for kno.li: data handling, account usage, app policies, and legal information.",
};

export default function TncPage() {
  return (
    <div className={`min-h-screen bg-background px-4 py-10 ${inter.className}`}>
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Privacy Policy &amp; Terms and Conditions
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Last updated: February 28, 2026.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            This page sets out how kno.li collects and uses your data, and the
            terms that apply when you use our service. By using kno.li you agree
            to both.
          </p>
        </header>

        <article className="space-y-8 text-sm text-muted-foreground">
          {/* ——— Privacy Policy ——— */}
          <section
            id="privacy"
            className="scroll-mt-24 space-y-6 border-b border-border pb-8"
          >
            <h2 className="text-lg font-semibold text-foreground">
              Privacy Policy
            </h2>

            <div id="account-data" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Account data
              </h3>
              <p>
                When you sign in with Google (OAuth), we receive and store
                account identifiers necessary to provide the service. We do not
                receive or store your Google password. The profile information
                you can edit (username, display name, avatar, and bio) is stored
                on our systems and may be shown on your public profile and in
                app previews. Billing status (e.g. free, premium, ultra) is
                kept in sync with our payment provider via webhook events so we
                can enforce plan limits and features.
              </p>
            </div>

            <div id="analytics" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Analytics collection
              </h3>
              <p>
                For apps on paid plans, we collect analytics about how your
                public profile and links are used. This is done through
                kno.li-owned API endpoints only; we do not use third-party
                tracking pixels or scripts for this. We use hashed
                visitor/session identifiers so we can aggregate counts (e.g.
                unique visitors, page views) without storing raw personal
                identifiers. Data such as referrer and path are used to power
                the analytics dashboard (e.g. which links were clicked, from
                where). Free plans do not include analytics; only paid plans
                receive full analytics with breakdowns.
              </p>
            </div>

            <div id="ip-geo" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                IP addresses and geolocation
              </h3>
              <p>
                We may use request metadata (including IP address) to infer
                country for aggregated analytics and to protect the service
                (e.g. rate limiting). IP addresses are not shown in the
                dashboard; only country-level reporting is retained for trend
                analysis. We apply rate limits on sensitive endpoints to protect
                reliability and prevent abuse.
              </p>
            </div>
          </section>

          {/* ——— Terms & Conditions ——— */}
          <section
            id="terms"
            className="scroll-mt-24 space-y-6 border-b border-border pb-8"
          >
            <h2 className="text-lg font-semibold text-foreground">
              Terms and Conditions
            </h2>
            <p>
              These terms govern your use of kno.li: account creation, app
              creation, usernames, custom domains, billing, and acceptable use.
              If you do not agree, please do not use the service.
            </p>

            <div id="username-policy" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Username policy
              </h3>
              <p>
                Usernames are allocated on a first-come, first-served basis and
                must pass our policy review. Certain routes and reserved words
                (e.g. dashboard, api, admin) cannot be claimed. Usernames that
                are offensive, abusive, or intended to impersonate others may
                be removed. We may reclaim usernames that violate these rules
                or that infringe legal or trademark rights.
              </p>
            </div>

            <div id="app-policies" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                App policies
              </h3>
              <p>
                You are responsible for all content and links you publish in
                your app. Do not publish misleading claims, malware, deceptive
                redirects, or content that violates laws or third-party
                rights. Apps that breach these terms may be limited, unpublished,
                or removed. We may request changes or take action to comply
                with law or to protect the platform and other users.
              </p>
            </div>

            <div id="acceptable-use" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Acceptable use
              </h3>
              <p>
                You must not use kno.li for spam, phishing, harassment,
                illegal activity, or to violate the rights of others. You must
                respect intellectual property and privacy. You are responsible
                for complying with applicable laws in your jurisdiction. We
                reserve the right to suspend or terminate accounts that violate
                acceptable use.
              </p>
            </div>

            <div id="billing" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Billing and plans
              </h3>
              <p>
                Free: one app, basic features, no custom domains and no
              analytics. Premium (Pro): up to 3 apps, full analytics, custom
                domains. Ultra: up to 15 apps, full analytics, custom domains,
                and early access to new features. Plan limits and pricing are
                set out on the pricing page. Subscription and payment are
                handled by our payment provider; refunds and cancellations are
                subject to their and our stated policies.
              </p>
            </div>

            <div id="custom-domains" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Custom domain verification
              </h3>
              <p>
                Custom domains are available on Premium and Ultra plans. To
                connect a domain: add it in your dashboard, then create a TXT
                record on your domain with the
                value we provide. Point a CNAME for your subdomain (or apex, if
                supported) to the kno.li target we assign. After DNS
                propagation, use the verify action in the dashboard. You are
                responsible for maintaining valid DNS and for the domain's use
                in line with these terms.
              </p>
            </div>

            <div id="analytics-privacy" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Analytics and privacy
              </h3>
              <p>
                Analytics are collected in-house via kno.li APIs. We use hashed
                visitor/session identifiers and do not expose raw personal
                identifiers in the dashboard. Country-level data is stored in
                aggregated form for reporting. For full details on what we
                collect and how we use it, see the Privacy Policy section above.
              </p>
            </div>

            <div id="enforcement" className="scroll-mt-24 space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Enforcement and appeals
              </h3>
              <p>
                kno.li may reclaim usernames, limit or remove apps, or suspend
                accounts when we reasonably believe the username or use violates
                these terms or the law. For trademark or impersonation
                disputes we may request proof of rights. If you believe an
                enforcement action was mistaken, you may contact support to
                request a manual review; we will consider appeals in good faith
                but are not obliged to reverse a decision.
              </p>
            </div>
          </section>

          <p className="text-xs text-muted-foreground">
            Questions about privacy or terms can be sent via the support
            channels linked in the app. Continued use of kno.li after changes
            to this page constitutes acceptance of the updated Privacy Policy
            and Terms and Conditions.
          </p>
        </article>
      </div>
    </div>
  );
}
