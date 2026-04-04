import { Button } from "@/components/ui/button";
import { ModeToggle } from "./components/ModeToggle";

export default function Home() {
  return (
    <main className="min-h-screen pt-14">
      <ModeToggle />
      <section className="mx-auto flex w-full flex-col gap-16 px-5 md:px-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-lg bg-primary/20 px-4 py-2 text-sm font-medium text-accent-foreground text-center">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Track your trading performance like a pro
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground text-center md:text-left">
              Track and Analyze Your Trades
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground text-center md:text-left">
              <span className="text-primary font-medium">Glint</span> makes
              journaling, analytics, and decision-making seamless for active
              traders. Make every trade count with visual insights, personalized
              dashboards, and risk-aware planning.
            </p>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Button asChild size="lg" className="text-sm font-semibold">
                <a href="/signup">Get Started</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-sm font-semibold"
              >
                <a href="/features">Learn More</a>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
            <div className="mb-5 rounded-xl bg-linear-to-r from-primary via-secondary to-accent p-4 text-primary-foreground">
              <span className="text-xs font-semibold uppercase tracking-wide">
                Live preview
              </span>
              <p className="mt-1 text-sm">Portfolio performance at a glance</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted p-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Trades
                </span>
                <span className="text-xl font-bold text-foreground">384</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted p-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Win Rate
                </span>
                <span className="text-xl font-bold text-destructive">68%</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted p-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Average R:R
                </span>
                <span className="text-xl font-bold text-primary">1.9</span>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-7">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Core Features
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Everything you need to move from guesswork to strategy-leading
              trade execution.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                ���
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Trade Logging
              </h3>
              <p className="mt-2 text-muted-foreground">
                Capture entry, exit, thesis, and emotion to build data-driven
                muscle memory.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                ���
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Insights & Analytics
              </h3>
              <p className="mt-2 text-muted-foreground">
                Visualize performance, winning setups, and risk metrics with
                smart charts.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                ���
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Dashboards
              </h3>
              <p className="mt-2 text-muted-foreground">
                Customize your workspace and monitor key indicators in
                real-time.
              </p>
            </article>
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Pricing Plans
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Simple, transparent pricing that scales with your trading goals.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-foreground">Free</h3>
              <p className="mt-2 text-4xl font-extrabold text-foreground">
                $0
                <span className="text-lg font-medium text-muted-foreground">
                  /month
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>✔ Up to 100 trades/month</li>
                <li>✔ Basic analytics</li>
                <li>✔ community support</li>
              </ul>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="mt-6 w-full"
              >
                <a href="/signup">Start Free</a>
              </Button>
            </div>
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-6 shadow-md">
              <h3 className="text-2xl font-bold text-foreground">Pro</h3>
              <p className="mt-2 text-4xl font-extrabold text-foreground">
                $11.99
                <span className="text-lg font-medium text-muted-foreground">
                  /month
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>✔ Unlimited trades</li>
                <li>✔ Advanced insights + alerts</li>
                <li>✔ Custom dashboards</li>
              </ul>
              <Button asChild size="lg" className="mt-6 w-full">
                <a href="/signup">Go Pro</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-7">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Why Traders Switch
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Built for traders who want clarity, consistency, and confidence.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <figure className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-muted-foreground">
                “AI Coach helped me see exactly where I’m losing edge. My win
                rate and confidence have never been higher.”
              </p>
              <figcaption className="mt-4 font-semibold text-foreground">
                Alex R., Swing Trader
              </figcaption>
            </figure>
            <figure className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-muted-foreground">
                “The dashboard reveals patterns I missed for years. It’s the
                first tool I open every morning.”
              </p>
              <figcaption className="mt-4 font-semibold text-foreground">
                Maya T., Options Trader
              </figcaption>
            </figure>
            <figure className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-muted-foreground">
                “Best journaling workflow with performance insights in one
                place. My plan execution is much smoother now.”
              </p>
              <figcaption className="mt-4 font-semibold text-foreground">
                Ryan B., Day Trader
              </figcaption>
            </figure>
          </div>
        </section>
      </section>

      <footer className="border-t border-border bg-background py-14 mt-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col flex-wrap items-center justify-between gap-4 px-5 text-sm text-muted-foreground md:flex-row md:px-10">
          <p className="font-medium mb-6">
            © {new Date().getFullYear()}{" "}
            <span className="text-primary">Glint</span>. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 font-normal">
            <a href="/login" className="hover:text-foreground">
              Login
            </a>
            <a href="/signup" className="hover:text-foreground">
              Sign Up
            </a>
            <a href="#" className="hover:text-foreground">
              Pricing
            </a>
            <a href="#" className="hover:text-foreground">
              Features
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
