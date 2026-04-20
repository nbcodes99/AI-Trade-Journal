import { Button } from "@/components/ui/button";
import { ModeToggle } from "../components/ModeToggle";

const features = [
  {
    icon: "📓",
    tag: "Trade Logging",
    title: "Journal Every Trade with Precision",
    description:
      "Log entries, exits, thesis, and emotions in seconds. Build a structured playbook that reveals your true trading identity over time.",
    bullets: [
      "Entry & exit price, size, and timing",
      "Thesis tagging + emotional state tracking",
      "Strategy and setup categorization",
    ],
    accent: "from-primary/20 to-primary/5",
    border: "border-primary/20",
    badge: "bg-primary/15 text-primary",
  },
  {
    icon: "📊",
    tag: "Analytics",
    title: "See the Patterns You've Been Missing",
    description:
      "Transform raw trade data into visual intelligence. Understand which setups win, when you perform best, and where you're leaving money on the table.",
    bullets: [
      "Win rate, P&L, and R:R breakdowns",
      "Best setup & time-of-day analysis",
      "Streak tracking and drawdown curves",
      "Comparison across weeks, months, and strategies",
    ],
    accent: "from-secondary/20 to-secondary/5",
    border: "border-secondary/20",
    badge: "bg-secondary/15 text-secondary-foreground",
  },
  {
    icon: "🤖",
    tag: "AI Coach",
    title: "An Analyst Who Knows Your Book",
    description:
      "Get personalized insight on your behavior, habits, and missed opportunities. The AI Coach reads your journal and delivers honest feedback — like a mentor who never sleeps.",
    bullets: [
      "Weekly performance summaries",
      "Pattern-based trading suggestions",
      "Risk exposure alerts",
      "Behavioral nudges and journaling prompts",
    ],
    accent: "from-primary/10 via-secondary/10 to-accent/10",
    border: "border-primary/10",
    badge: "bg-primary/10 text-primary",
  },
  {
    icon: "🛡️",
    tag: "Risk Manager",
    title: "Trade Bigger by Risking Smarter",
    description:
      "Define your rules, set position sizing models, and let Glint flag violations before they become regrets. Stay in the game longer by respecting the math.",
    bullets: [
      "Max daily loss and drawdown limits",
      "Position sizing calculator (fixed/% risk)",
      "Pre-trade checklist enforcement",
      "Alert before breaching defined thresholds",
    ],
    accent: "from-destructive/10 to-destructive/5",
    border: "border-destructive/20",
    badge: "bg-destructive/10 text-destructive",
  },
  {
    icon: "🔗",
    tag: "Integrations",
    title: "Plug In and Go",
    description:
      "Connect directly to your broker or import trade history with a single click. Spend less time entering data and more time analyzing it.",
    bullets: [
      "CSV & broker import (TD, IBKR, Webull)",
      "Webhook-based auto-logging",
      "TradingView chart links",
      "Export to Excel or PDF",
    ],
    accent: "from-muted/60 to-muted/20",
    border: "border-border",
    badge: "bg-muted text-muted-foreground",
  },
];

const stats = [
  { value: "50+", label: "Active Traders" },
  { value: "3k+", label: "Trades Logged" },
  { value: "68%", label: "Avg WR" },
  { value: "4.9★", label: "User Rating" },
];

export default function Features() {
  return (
    <main className="min-h-screen">
      {/* <ModeToggle /> */}

      <section className="relative mx-auto flex w-full flex-col items-center gap-6 px-5 py-20 text-center md:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          ✦ Platform Features
        </span>
        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
          Everything a Serious{" "}
          <span className="text-primary">Trader Needs</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Glint is built from the ground up for traders who want to go from
          reactive to systematic — with tools that grow alongside your edge.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg" className="font-semibold">
            <a href="/signup">Start for Free</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <a href="/pricing">View Pricing</a>
          </Button>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-8 overflow-hidden">
        <div className="flex w-max animate-marquee gap-16 px-8 md:hidden">
          {[...stats, ...stats].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-max">
              <span className="text-3xl font-extrabold text-primary">
                {s.value}
              </span>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="hidden md:grid mx-auto grid-cols-4 gap-8 px-10">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-primary">
                {s.value}
              </span>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-5 py-24 md:px-10 text-center">
        {features.map((f, i) => (
          <div
            key={f.tag}
            className={`grid items-center gap-10 lg:grid-cols-2 ${
              i % 2 !== 0 ? "lg:[direction:rtl]" : ""
            }`}
          >
            <div
              className={`space-y-5 ${i % 2 !== 0 ? "lg:[direction:ltr]" : ""}`}
            >
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${f.badge}`}
              >
                {f.icon} {f.tag}
              </span>
              <h2 className="text-3xl font-extrabold leading-snug text-foreground md:text-4xl">
                {f.title}
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                {f.description}
              </p>
              <ul className="space-y-2">
                {f.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 text-primary">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`rounded-3xl border ${f.border} bg-gradient-to-br ${f.accent} p-8 backdrop-blur-sm ${
                i % 2 !== 0 ? "lg:[direction:ltr]" : ""
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/60 text-xl shadow-sm">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {f.tag}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Live Preview
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {f.bullets.map((b, j) => (
                    <div
                      key={b}
                      className="flex items-center justify-between rounded-xl bg-background/50 px-4 py-3 shadow-sm text-left"
                      style={{ opacity: 1 - j * 0.1 }}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {b}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-primary hidden md:block" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="relative mx-auto mb-20 max-w-5xl overflow-hidden rounded-3xl px-5 md:px-10">
        <div className="rounded-3xl bg-gradient-to-r from-primary via-primary/80 to-secondary p-12 text-center text-primary-foreground shadow-2xl">
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_60%_80%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />
          <h2 className="relative text-4xl font-extrabold tracking-tight">
            Ready to Trade with an Edge?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Join thousands of traders who replaced guesswork with data. Free to
            start, no credit card required.
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href="/signup">Get Started Free</a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="/pricing">Compare Plans</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
