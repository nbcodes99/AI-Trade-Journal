"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp,
  BarChart2,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  BookOpen,
  Target,
  Activity,
} from "lucide-react";
import type { Variants } from "framer-motion";
// import FloatingIcons from "./components/FloatingIcons";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: "easeOut" as const,
    },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: "easeOut" as const,
    },
  }),
};

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/40 text-xs">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/80">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="font-bold text-foreground text-[11px]">
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-5 rounded-full bg-primary/20 border border-primary/30" />
        </div>
      </div>
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { l: "Total P&L", v: "+$4,820", c: "text-primary" },
            { l: "Win Rate", v: "73.0%", c: "text-primary" },
            { l: "Trades", v: "147", c: "text-foreground" },
            { l: "Best Trade", v: "+$640", c: "text-primary" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl bg-muted/40 border border-border/40 p-2"
            >
              <p className="text-[8px] text-muted-foreground uppercase tracking-wide">
                {s.l}
              </p>
              <p className={`text-[11px] font-extrabold mt-0.5 ${s.c}`}>
                {s.v}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-muted/30 border border-border/40 p-2.5">
          <p className="text-[8px] text-muted-foreground mb-2">Equity Curve</p>
          <svg viewBox="0 0 260 50" className="w-full">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <path
              d="M0,40 C20,35 30,25 50,22 S80,30 100,18 S130,8 150,12 S180,20 200,10 S230,4 260,6"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M0,40 C20,35 30,25 50,22 S80,30 100,18 S130,8 150,12 S180,20 200,10 S230,4 260,6 L260,50 L0,50 Z"
              fill="url(#g)"
            />
          </svg>
        </div>
        <div className="rounded-xl bg-muted/20 border border-border/40 overflow-hidden">
          <div className="grid grid-cols-4 px-2.5 py-1.5 bg-muted/40">
            {["Asset", "Setup", "Result", "ROI"].map((h) => (
              <p
                key={h}
                className="text-[7px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </p>
            ))}
          </div>
          {[
            {
              a: "BTCUSD",
              s: "ICT OB",
              r: "WIN",
              roi: "+3.68%",
              c: "text-primary",
            },
            {
              a: "EURUSD",
              s: "SMC CHoCH",
              r: "WIN",
              roi: "+1.92%",
              c: "text-primary",
            },
            {
              a: "XAUUSD",
              s: "Liq. Grab",
              r: "LOSS",
              roi: "-0.85%",
              c: "text-destructive",
            },
          ].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 px-2.5 py-1.5 border-t border-border/30"
            >
              <p className="text-[8px] font-bold text-foreground">{row.a}</p>
              <p className="text-[8px] text-muted-foreground">{row.s}</p>
              <p className={`text-[8px] font-bold ${row.c}`}>{row.r}</p>
              <p className={`text-[8px] font-bold ${row.c}`}>{row.roi}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JournalMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/40 text-xs">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/80">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3 w-3 text-primary" />
          <span className="font-bold text-foreground text-[11px]">
            Log Trade
          </span>
        </div>
        <div className="h-5 w-16 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-[8px] text-primary font-bold">+ New Trade</span>
        </div>
      </div>
      <div className="p-3 space-y-2.5">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[8px] text-muted-foreground">Live Preview</p>
            <p className="text-[11px] font-extrabold text-primary">+$247.50</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-muted-foreground">ROI</p>
            <p className="text-[11px] font-extrabold text-primary">+2.48%</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-muted-foreground">R:R</p>
            <p className="text-[11px] font-extrabold text-foreground">2.1R</p>
          </div>
          <div className="h-6 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <p className="text-[8px] font-bold text-primary">WIN</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: "Asset", v: "BTCUSD", tag: "1" },
            { l: "Direction", v: "Long ↑", tag: "1" },
            { l: "Entry Price", v: "76,000", tag: "2" },
            { l: "Exit Price", v: "76,500", tag: "2" },
            { l: "Setup", v: "ICT Order Block", tag: "3" },
            { l: "Emotion", v: "Confident", tag: "3" },
          ].map((f) => (
            <div
              key={f.l}
              className="rounded-lg bg-muted/30 border border-border/40 px-2 py-1.5"
            >
              <p className="text-[7px] text-muted-foreground uppercase tracking-wide">
                {f.l}
              </p>
              <p className="text-[9px] font-semibold text-foreground mt-0.5">
                {f.v}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-muted/20 border border-border/40 px-2.5 py-2">
          <p className="text-[7px] text-muted-foreground mb-1.5">
            PRE-TRADE CONFIDENCE
          </p>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`h-3 flex-1 rounded-sm ${i < 8 ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {["Above VWAP", "EMA stack", "Session high", "London open"].map(
            (t) => (
              <span
                key={t}
                className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[7px] font-semibold text-primary"
              >
                {t}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function InsightsMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/40 text-xs">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/80">
        <div className="flex items-center gap-2">
          <Brain className="h-3 w-3 text-primary" />
          <span className="font-bold text-foreground text-[11px]">
            AI Coach Analysis
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[8px] text-primary font-semibold">Live</span>
        </div>
      </div>
      <div className="p-3 space-y-2.5">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { l: "Win Rate", v: "73%", c: "text-primary" },
            { l: "Profit Factor", v: "2.4", c: "text-primary" },
            { l: "Max DD", v: "-4.2%", c: "text-destructive" },
            { l: "Best Streak", v: "8W", c: "text-primary" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-lg bg-muted/40 border border-border/40 p-1.5 text-center"
            >
              <p className="text-[7px] text-muted-foreground">{s.l}</p>
              <p className={`text-[10px] font-extrabold ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-muted/20 border border-border/40 p-2">
          <p className="text-[7px] text-muted-foreground mb-2 uppercase tracking-wide">
            Win Rate by Emotion
          </p>
          <div className="space-y-1.5">
            {[
              { e: "Disciplined", w: 88, c: "bg-primary" },
              { e: "Confident", w: 74, c: "bg-primary" },
              { e: "Calm", w: 68, c: "bg-primary/70" },
              { e: "Fearful", w: 32, c: "bg-destructive" },
              { e: "Greedy", w: 21, c: "bg-destructive" },
            ].map((r) => (
              <div key={r.e} className="flex items-center gap-2">
                <p className="text-[7px] text-muted-foreground w-14 shrink-0">
                  {r.e}
                </p>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.c}`}
                    style={{ width: `${r.w}%` }}
                  />
                </div>
                <p
                  className={`text-[7px] font-bold w-6 text-right ${r.w > 50 ? "text-primary" : "text-destructive"}`}
                >
                  {r.w}%
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5">
          <p className="text-[7px] text-muted-foreground leading-relaxed">
            <span className="text-primary font-bold">Your edge is clear:</span>{" "}
            ICT Order Block and SMC CHoCH setups deliver 81% win rates. You
            perform best on Tuesday and Wednesday during London session.
            Emotional state &quot;disciplined&quot; correlates with your highest
            ROI trades. Reduce size on Friday — your worst performing day by
            40%.
          </p>
        </div>
        <div className="rounded-xl bg-muted/20 border border-border/40 overflow-hidden">
          <div className="grid grid-cols-3 px-2.5 py-1.5 bg-muted/40">
            {["Setup", "Win Rate", "Edge"].map((h) => (
              <p
                key={h}
                className="text-[7px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </p>
            ))}
          </div>
          {[
            { s: "ICT Order Block", w: "81%", e: "Strong" },
            { s: "SMC CHoCH", w: "74%", e: "Strong" },
            { s: "Liq. Grab", w: "69%", e: "Neutral" },
          ].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 px-2.5 py-1.5 border-t border-border/30"
            >
              <p className="text-[7px] font-semibold text-foreground">
                {row.s}
              </p>
              <p className="text-[7px] font-bold text-primary">{row.w}</p>
              <span className="inline-flex w-fit rounded-full bg-primary/15 px-1.5 py-0.5 text-[6px] font-bold text-primary">
                {row.e}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const heroRef = useRef(null);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 md:px-10 pt-20 pb-16 overflow-hidden">
        {/* <FloatingIcons count={22} /> */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary">
                The Trading Journal Built for Serious Traders
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-foreground max-w-4xl"
            >
              Turn Every Trade Into{" "}
              <span className="relative inline-block">
                <span className="text-primary">Data</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/40 rounded-full origin-left"
                />
              </span>
              {". "}
              Build Your <span className="text-primary">Edge</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-xl text-lg text-muted-foreground leading-relaxed"
            >
              Glint is the all-in-one trading journal with AI coaching, deep
              analytics, and risk management — so you stop guessing and start
              winning systematically.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-12 px-8 font-bold text-base gap-2 shadow-lg shadow-primary/20"
                >
                  Start for Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 font-bold text-base"
                >
                  See Features
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {["S", "A", "M", "R"].map((l, i) => (
                    <div
                      key={i}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 border-2 border-background text-[10px] font-bold text-primary"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <span>50+ traders</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-primary text-primary"
                  />
                ))}
                <span className="ml-1">4.9 rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mt-16 relative"
          >
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-xl" />
            <div className="relative rounded-2xl border border-border/60 overflow-hidden shadow-2xl shadow-black/50 bg-background/80 backdrop-blur-sm p-1">
              <DashboardMockup />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="absolute -left-4 md:-left-10 top-12 hidden md:block"
            >
              <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl p-3 shadow-xl w-36">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                  Today P&L
                </p>
                <p className="text-lg font-extrabold text-primary mt-0.5">
                  +$820
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <p className="text-[9px] text-primary font-semibold">
                    +4.1% today
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="absolute -right-4 md:-right-10 bottom-12 hidden md:block"
            >
              <div className="rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl p-3 shadow-xl w-40">
                <div className="flex items-center gap-1.5 mb-1">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[9px] font-bold text-primary uppercase tracking-wide">
                    AI Coach
                  </p>
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  Your edge is strongest on Tue–Wed with ICT setups. Reduce
                  Friday exposure.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-5 md:px-10">
        <div className="max-w-6xl mx-auto space-y-32">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <motion.div variants={fadeUp} custom={0}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <BarChart2 className="h-3 w-3" /> Analytics Dashboard
                  </span>
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight"
                >
                  See the full picture of your trading performance.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-muted-foreground leading-relaxed"
                >
                  Your equity curve, win rate, profit factor, drawdown, and best
                  setups — all in one place. Updated in real time as you log
                  trades.
                </motion.p>
                <motion.ul variants={fadeUp} custom={3} className="space-y-2.5">
                  {[
                    "Equity curve with area chart visualization",
                    "Win rate, P&L, profit factor, and R:R breakdowns",
                    "Best setup and best day-of-week analysis",
                    "Max drawdown and streak tracking",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </motion.ul>
              </div>
              <motion.div variants={fadeUp} custom={2} className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-xl" />
                <div className="relative">
                  <DashboardMockup />
                </div>
              </motion.div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                variants={fadeUp}
                custom={2}
                className="relative order-2 lg:order-1"
              >
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-xl" />
                <div className="relative">
                  <JournalMockup />
                </div>
              </motion.div>
              <div className="space-y-6 order-1 lg:order-2">
                <motion.div variants={fadeUp} custom={0}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <BookOpen className="h-3 w-3" /> Trade Journal
                  </span>
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight"
                >
                  Log trades with precision. See P&L instantly.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-muted-foreground leading-relaxed"
                >
                  Every field that matters — entry, exit, position size, setup,
                  emotion, confluence — with a live P&L preview as you type. No
                  spreadsheet can do this.
                </motion.p>
                <motion.ul variants={fadeUp} custom={3} className="space-y-2.5">
                  {[
                    "Live P&L, ROI%, and R:R calculated as you type",
                    "25+ professional setup patterns to choose from",
                    "Confluence tag builder for your reasons",
                    "CSV import from any broker",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </motion.ul>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <motion.div variants={fadeUp} custom={0}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Brain className="h-3 w-3" /> AI Coach
                  </span>
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight"
                >
                  An analyst who knows your entire trading history.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-muted-foreground leading-relaxed"
                >
                  The AI Coach reads every trade you&apos;ve ever logged and
                  delivers sharp, specific feedback — not generic advice. It
                  tells you exactly which setups are your edge and where
                  you&apos;re leaving money on the table.
                </motion.p>
                <motion.ul variants={fadeUp} custom={3} className="space-y-2.5">
                  {[
                    "Win rate by emotion, setup, and day of week",
                    "Behavioral pattern detection across all your trades",
                    "Drawdown curve and max loss analysis",
                    "Weekly AI-generated coaching report",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </motion.ul>
              </div>
              <motion.div variants={fadeUp} custom={2} className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-xl" />
                <div className="relative">
                  <InsightsMockup />
                </div>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <AnimatedSection className="py-20 px-5 md:px-10 border-y border-border/40 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-extrabold text-foreground"
            >
              Everything a serious trader needs
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-3 text-muted-foreground max-w-xl mx-auto"
            >
              Built from the ground up for traders who want to go from reactive
              to systematic.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                title: "Precision Journaling",
                desc: "Log entry, exit, size, setup, emotion, and confluence in seconds. Live P&L preview as you type.",
              },
              {
                icon: BarChart2,
                title: "Deep Analytics",
                desc: "Win rate, profit factor, drawdown curves, setup performance, and day-of-week analysis.",
              },
              {
                icon: Brain,
                title: "AI Coach",
                desc: "Personalized coaching based on your actual trade history. Delivered as weekly reports.",
              },
              {
                icon: Shield,
                title: "Risk Manager",
                desc: "Define your rules, set daily loss limits, and calculate exact position sizes before every trade.",
              },
              {
                icon: Activity,
                title: "Equity Curve",
                desc: "Watch your account grow trade by trade with an interactive area chart.",
              },
              {
                icon: Target,
                title: "Pre-Trade Checklist",
                desc: "A customizable checklist you run through before every trade to stay disciplined.",
              },
              {
                icon: Zap,
                title: "CSV Import",
                desc: "Import your full trade history from any broker in seconds with automatic field mapping.",
              },
              {
                icon: TrendingUp,
                title: "Setup Analysis",
                desc: "Discover which of your setups actually makes money and which ones are killing your edge.",
              },
              {
                icon: CheckCircle2,
                title: "Emotion Tracking",
                desc: "Understand how your emotional state affects your win rate — backed by your own data.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i * 0.5}
                className="group rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 mb-4 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-20 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-extrabold text-foreground"
            >
              Traders who made the switch
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "AI Coach showed me exactly where I was leaking edge. My win rate went from 48% to 71% in 6 weeks just by cutting the setups it flagged as weak.",
                name: "Alex R.",
                role: "Swing Trader · Forex",
                rating: 5,
              },
              {
                quote:
                  "The position size calculator alone is worth it. I used to guess my lot size and it was costing me. Now I risk exactly 1% every single trade.",
                name: "Maya T.",
                role: "Day Trader · Crypto",
                rating: 5,
              },
              {
                quote:
                  "I discovered I was losing 80% of trades taken on Fridays. Simple fix — I stopped trading Fridays. P&L improved immediately.",
                name: "Ryan B.",
                role: "Scalper · Indices",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                custom={i * 0.5}
                className="rounded-2xl border border-border/60 bg-card p-6 space-y-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-extrabold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <AnimatedSection className="py-20 px-5 md:px-10 border-t border-border/40 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-extrabold text-foreground"
            >
              Simple pricing. Real results.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-3 text-muted-foreground"
            >
              Start free. Upgrade when you&apos;re ready. No hidden fees.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "Free",
                price: "$0",
                period: "/month",
                desc: "Start journaling. No strings attached.",
                features: [
                  "Up to 100 trades/month",
                  "Basic analytics dashboard",
                  "Manual trade logging",
                  "CSV import",
                  "Community support",
                ],
                cta: "Start Free",
                href: "/signup",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$11.99",
                period: "/month",
                desc: "For traders serious about improving their edge.",
                badge: "Most Popular",
                features: [
                  "Unlimited trades",
                  "Full analytics + AI Coach",
                  "Risk Manager",
                  "Broker integrations",
                  "Priority support",
                  "CSV & PDF export",
                ],
                cta: "Go Pro",
                href: "/signup?plan=pro",
                highlight: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i * 0.5}
                className={`relative rounded-3xl border p-8 ${plan.highlight ? "border-primary/40 bg-primary/5 scale-[1.02]" : "border-border bg-card"}`}
              >
                {plan.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-xl font-extrabold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1 mt-4">
                  <span className="text-4xl font-extrabold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground mb-1">
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-6 space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full font-semibold h-11"
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-20 px-5 md:px-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            custom={0}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-12 text-center shadow-2xl shadow-primary/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(hsl(0,0%,100%,0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(0,0%,100%,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground">
                Your next trade could be your best.
              </h2>
              <p className="text-primary-foreground/80 max-w-md mx-auto">
                Join traders who replaced guesswork with data. Free to start. No
                credit card required.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-background text-foreground hover:bg-background/90 font-bold h-12 px-8"
                  >
                    Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-bold h-12 px-8"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-primary-foreground/50">
                Free forever on the Free plan · No credit card · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </main>
  );
}
