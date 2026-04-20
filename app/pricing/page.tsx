import { Button } from "@/components/ui/button";
import { ModeToggle } from "../components/ModeToggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    tagline: "Start journaling. No strings attached.",
    cta: "Start for Free",
    href: "/signup",
    variant: "secondary" as const,
    highlight: false,
    features: [
      { text: "Up to 100 trades/month", included: true },
      { text: "Basic analytics dashboard", included: true },
      { text: "Manual trade logging", included: true },
      { text: "Community support", included: true },
      { text: "CSV import", included: true },
      { text: "Advanced insights & alerts", included: false },
      { text: "AI Coach feedback", included: false },
      { text: "Risk Manager", included: false },
      { text: "Broker integrations", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$11.99",
    period: "/month",
    tagline: "For traders serious about improving their edge.",
    cta: "Go Pro",
    href: "/signup?plan=pro",
    variant: "default" as const,
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited trades", included: true },
      { text: "Full analytics dashboard", included: true },
      { text: "Manual + auto trade logging", included: true },
      { text: "Priority support", included: true },
      { text: "CSV & broker import", included: true },
      { text: "Advanced insights & alerts", included: true },
      { text: "AI Coach feedback", included: true },
      { text: "Risk Manager", included: true },
      { text: "Broker integrations (IBKR, TD, Webull)", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrade or downgrade at any time. Changes apply at the start of your next billing cycle, and we never charge hidden fees.",
  },
  {
    q: "Is my trading data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. We never sell your information, and you can export or delete it at any time.",
  },
  {
    q: "What brokers are supported for auto-import?",
    a: "Glint currently supports Interactive Brokers, TD Ameritrade, Webull, and generic CSV imports. More brokers are added regularly.",
  },
  {
    q: "Does the Free plan have a time limit?",
    a: "No. The Free plan is free forever. You only upgrade when you're ready to unlock advanced features and unlimited logging.",
  },
  {
    q: "What is the AI Coach?",
    a: "The AI Coach analyzes your trade journal to surface behavioral patterns, missed opportunities, and improvement areas — delivered as a weekly personalized report.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. If you're not satisfied within the first 14 days of a Pro subscription, we'll refund you in full — no questions asked.",
  },
];

const comparison = [
  { feature: "Trades per month", free: "100", pro: "Unlimited" },
  { feature: "Analytics", free: "Basic", pro: "Advanced" },
  { feature: "AI Coach", free: "—", pro: "✓" },
  { feature: "Custom Dashboards", free: "—", pro: "✓" },
  { feature: "Risk Manager", free: "—", pro: "✓" },
  { feature: "Broker Integrations", free: "—", pro: "✓" },
  { feature: "Alerts & Notifications", free: "—", pro: "✓" },
  { feature: "Support", free: "Community", pro: "Priority" },
  { feature: "Data Export", free: "CSV", pro: "CSV + PDF" },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center w-full">
      <section className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-5 py-20 text-center md:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsl(var(--primary)/0.1),transparent)]" />
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          ✦ Pricing
        </span>
        <h1 className="max-w-2xl text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
          Simple Pricing. <span className="text-primary">Real Results.</span>
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Start free, upgrade when you're ready. No hidden fees. Cancel anytime.
          Built for traders at every level.
        </p>
      </section>

      <section className="mx-auto mb-24 grid max-w-4xl gap-6 px-5 md:grid-cols-2 md:px-10">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-3xl border p-8 shadow-sm transition-all duration-300 ${
              plan.highlight
                ? "border-primary/40 bg-primary/8 shadow-primary/10 shadow-lg scale-[1.02]"
                : "border-border bg-card"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-foreground">
                {plan.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.tagline}
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-extrabold text-foreground">
                  {plan.price}
                </span>
                <span className="mb-1.5 text-base text-muted-foreground">
                  {plan.period}
                </span>
              </div>
            </div>

            <ul className="mb-8 flex-1 flex flex-col space-y-3">
              {plan.features.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      f.included
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground/40"
                    }`}
                  >
                    {f.included ? "✓" : "—"}
                  </span>
                  <span
                    className={
                      f.included
                        ? "text-foreground"
                        : "text-muted-foreground/50 line-through"
                    }
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant={plan.variant}
              size="lg"
              className="w-full font-semibold"
            >
              <a href={plan.href}>{plan.cta}</a>
            </Button>
          </div>
        ))}
      </section>

      <section className="mx-auto mb-24 max-w-5xl px-5 md:px-10 w-full">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Plan Comparison
          </h2>
          <p className="mt-2 text-muted-foreground">
            A side-by-side breakdown of what's included.
          </p>
        </div>
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground px-4 md:px-8 py-3 md:py-5">
                  Feature
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground px-4 md:px-8 py-3 md:py-5">
                  Free
                </TableHead>
                <TableHead className="text-center font-semibold text-primary px-4 md:px-8 py-3 md:py-5">
                  Pro
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.map((row, i) => (
                <TableRow
                  key={row.feature}
                  className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <TableCell className="font-medium text-foreground px-4 md:px-8 py-3 md:py-5">
                    {row.feature}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground px-4 md:px-8 py-3 md:py-5">
                    {row.free}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-primary px-4 md:px-8 py-3 md:py-5">
                    {row.pro}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <section className="mx-auto mb-24 max-w-4xl px-5 md:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: "🔒",
              title: "Bank-grade Security",
              desc: "AES-256 encryption, SOC 2 compliant, zero data selling. Your edge is yours.",
            },
            {
              icon: "💳",
              title: "No Card on Free",
              desc: "Sign up in under 30 seconds. No credit card required to start the Free plan.",
            },
            {
              icon: "↩️",
              title: "14-Day Refund",
              desc: "Not satisfied with Pro? We'll refund you within 14 days, no questions asked.",
            },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl">
              <CardContent className="flex flex-col items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-3xl px-5 md:px-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            Still have questions? Reach out at{" "}
            <Link
              href="mailto:support@glint.app"
              className="text-primary underline-offset-2 hover:underline"
            >
              support@glint.app
            </Link>
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-4 w-full">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.q}
              value={faq.q}
              className="rounded-2xl border border-border bg-card px-6 w-full"
            >
              <AccordionTrigger className="font-semibold text-foreground text-left hover:no-underline py-5 w-full">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="relative mx-auto mb-20 max-w-5xl px-5 md:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-12 text-center text-primary-foreground shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_-20%,rgba(255,255,255,0.18),transparent)]" />
          <h2 className="relative text-4xl font-extrabold tracking-tight">
            Your Next Trade Could Be Your Best
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-primary-foreground/80">
            Start free today. Level up your trading with data-driven clarity and
            a tool that grows with you.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 font-semibold"
            >
              <a href="/signup">Get Started — It's Free</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold"
            >
              <a href="/features">See All Features</a>
            </Button>
          </div>
          <p className="relative mt-4 text-xs text-primary-foreground/50">
            No credit card required · Cancel anytime · Free forever on the Free
            plan
          </p>
        </div>
      </section>
    </main>
  );
}
