"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { format, formatDistanceToNow, getDay } from "date-fns";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Lock,
  Sparkles,
  BookOpen,
  Star,
  Download,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Spinner } from "@radix-ui/themes";

// const chartConfig = {
//   value: { label: "Value" },
//   winRate: { label: "Win Rate %" },
//   pnl: { label: "P&L" },
// };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EMOTION_COLORS: Record<string, string> = {
  calm: "#16a34a",
  confident: "#2563eb",
  fearful: "#dc2626",
  greedy: "#d97706",
  neutral: "#6b7280",
  anxious: "#9333ea",
  excited: "#0891b2",
  disciplined: "#16a34a",
  impulsive: "#dc2626",
  frustrated: "#dc2626",
  tired: "#6b7280",
};

const DEV_MODE = false;
const DEV_TRADE_COUNT = 20;

const MIN_TRADES = 15;

function LockedState() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-foreground text-center">
            AI Insights
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 text-center">
            Your personal AI trading coach
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full space-y-8">
          <div className="relative">
            <div className="space-y-4 blur-sm pointer-events-none select-none opacity-60">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      Behavioral Analysis
                    </p>
                    <p className="text-xs text-muted-foreground">
                      AI Coach has reviewed your trades
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded-full w-full" />
                  <div className="h-3 bg-muted rounded-full w-5/6" />
                  <div className="h-3 bg-muted rounded-full w-4/6" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Setup Edge", "Emotion Impact", "Risk Patterns"].map((t) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="h-2 bg-muted rounded-full w-2/3 mb-3" />
                    <div className="h-8 bg-muted rounded-lg w-full mb-2" />
                    <div className="h-2 bg-muted rounded-full w-1/2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center mb-24">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-background/95 backdrop-blur-sm border border-border rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-auto"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-foreground mb-2">
                  Pro Feature
                </h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Upgrade to Pro to unlock your personal AI Coach — behavioral
                  analysis, setup edge detection, and personalized improvement
                  plans.
                </p>
                <Link href="/checkout">
                  <Button className="w-full gap-2 font-bold h-11">
                    <Sparkles className="h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  14-day money back guarantee · Cancel anytime
                </p>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              {
                icon: Brain,
                title: "Behavioral Coach",
                desc: "Understand your trading psychology and break bad habits.",
              },
              {
                icon: Target,
                title: "Setup Analysis",
                desc: "Know exactly which setups give you an edge and which don't.",
              },
              {
                icon: Shield,
                title: "Risk Patterns",
                desc: "Spot recurring risk mistakes before they cost you more.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-4 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">
                  {f.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotEnoughTrades({ count }: { count: number }) {
  const needed = MIN_TRADES - count;
  const pct = Math.round((count / MIN_TRADES) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-foreground">AI Insights</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your personal AI trading coach
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/15 border border-primary/20 mx-auto">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="h-24 w-24 rounded-3xl border-2 border-dashed border-primary/20" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary text-xs"
            >
              AI Coach is watching
            </Badge>
            <h2 className="text-2xl font-extrabold text-foreground">
              Your insights are almost ready
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The AI Coach needs at least{" "}
              <span className="text-foreground font-semibold">
                {MIN_TRADES} trades
              </span>{" "}
              to identify meaningful patterns in your behavior. You have{" "}
              <span className="text-primary font-bold">{count}</span> so far —
              log{" "}
              <span className="text-foreground font-semibold">
                {needed} more
              </span>{" "}
              to unlock your full analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                Progress to insights
              </span>
              <span className="font-bold text-primary">
                {count} / {MIN_TRADES}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground text-left">
              {needed} more trade{needed !== 1 ? "s" : ""} needed to unlock AI
              behavioral analysis
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              What unlocks at {MIN_TRADES} trades
            </p>
            {[
              "Behavioral pattern detection across all your entries",
              "Emotion vs win rate correlation analysis",
              "Setup edge ranking and improvement areas",
              "Personalized coaching recommendations",
              "Risk management flaw identification",
            ].map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-3 text-left"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{f}</span>
              </motion.div>
            ))}
          </div>

          <Link href="/journal">
            <Button className="w-full gap-2 font-bold h-11">
              <BookOpen className="h-4 w-4" />
              Log a Trade Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        <motion.circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
        <text
          x="48"
          y="48"
          textAnchor="middle"
          dy="0.35em"
          fontSize="16"
          fontWeight="700"
          fill="hsl(var(--foreground))"
        >
          {score}
        </text>
      </svg>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

export default function Insights() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [checkingPro, setCheckingPro] = useState(true);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);
  const [lastTradeCount, setLastTradeCount] = useState<number>(0);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSections, setAiSections] = useState<{
    overview: string;
    strengths: string;
    weaknesses: string;
    behavior: string;
    recommendation: string;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setCheckingPro(true);
      const [tradesRes, profileRes] = await Promise.all([
        supabase
          .from("trades")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),
        supabase
          .from("profiles")
          .select(
            "plan, ai_insights, ai_insights_sections, insights_generated_at, insights_trade_count",
          )
          .eq("id", userId)
          .single(),
      ]);

      const fetchedTrades = tradesRes.data || [];
      setTrades(fetchedTrades);
      setIsPro(profileRes.data?.plan === "pro");

      if (profileRes.data?.ai_insights_sections) {
        setAiSections(profileRes.data.ai_insights_sections);
        setAiInsights(profileRes.data.ai_insights || "");
        setLastGeneratedAt(profileRes.data.insights_generated_at || null);
        setLastTradeCount(profileRes.data.insights_trade_count || 0);
      }

      setLoading(false);
      setCheckingPro(false);
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (trades.length < MIN_TRADES || loading || !isPro) return;

    if (aiSections) {
      const newTradesSinceLast = trades.length - lastTradeCount;
      if (newTradesSinceLast >= 5) {
        generateAiInsights();
      }
      return;
    }

    generateAiInsights();
  }, [trades, loading, isPro]);

  const regenerateInsights = () => {
    // if (lastGeneratedAt) {
    //   const hoursSince =
    //     (Date.now() - new Date(lastGeneratedAt).getTime()) / (1000 * 60 * 60);
    //   if (hoursSince < 1) {
    //     const minutesLeft = Math.ceil((1 - hoursSince) * 60);
    //     toast.error(
    //       `Cooldown... Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
    //     );
    //     return;
    //   }
    // }
    generateAiInsights(true);
  };

  const getRoi = (t: any) => {
    const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return isNaN(r) ? 0 : r;
  };

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const winRate = totalTrades ? (wins / totalTrades) * 100 : 0;
  const totalPnL = trades.reduce((a, t) => a + getRoi(t), 0);
  const avgRoi = totalTrades ? totalPnL / totalTrades : 0;

  const grossWins = trades
    .filter((t) => t.result === "win")
    .reduce((a, t) => a + getRoi(t), 0);
  const grossLosses = Math.abs(
    trades
      .filter((t) => t.result === "loss")
      .reduce((a, t) => a + getRoi(t), 0),
  );
  const profitFactor =
    grossLosses > 0
      ? (grossWins / grossLosses).toFixed(2)
      : wins > 0
        ? "∞"
        : "0";

  let bestStreak = 0,
    worstStreak = 0,
    tempW = 0,
    tempL = 0;
  trades.forEach((t) => {
    if (t.result === "win") {
      tempW++;
      worstStreak = Math.max(worstStreak, tempL);
      tempL = 0;
    } else {
      tempL++;
      bestStreak = Math.max(bestStreak, tempW);
      tempW = 0;
    }
  });
  bestStreak = Math.max(bestStreak, tempW);
  worstStreak = Math.max(worstStreak, tempL);

  const avgWin =
    wins > 0
      ? trades
          .filter((t) => t.result === "win")
          .reduce((a, t) => a + getRoi(t), 0) / wins
      : 0;
  const avgLoss =
    losses > 0
      ? Math.abs(
          trades
            .filter((t) => t.result === "loss")
            .reduce((a, t) => a + getRoi(t), 0) / losses,
        )
      : 0;
  const rr = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "—";

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      const m = format(new Date(t.created_at || t.date), "MMM yy");
      map[m] = (map[m] || 0) + getRoi(t);
    });
    return Object.entries(map).map(([month, pnl]) => ({
      month,
      pnl: parseFloat(pnl.toFixed(2)),
    }));
  }, [trades]);

  const emotionData = useMemo(() => {
    const map: Record<string, { wins: number; total: number }> = {};
    trades.forEach((t) => {
      const e = (t.emotion || "Unknown").toLowerCase();
      if (!map[e]) map[e] = { wins: 0, total: 0 };
      map[e].total++;
      if (t.result === "win") map[e].wins++;
    });
    return Object.entries(map)
      .map(([emotion, v]) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        winRate: v.total ? Math.round((v.wins / v.total) * 100) : 0,
        count: v.total,
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);
  }, [trades]);

  const setupData = useMemo(() => {
    const map: Record<string, { wins: number; total: number; pnl: number }> =
      {};
    trades.forEach((t) => {
      const s = t.setup || "Unknown";
      if (!map[s]) map[s] = { wins: 0, total: 0, pnl: 0 };
      map[s].total++;
      if (t.result === "win") map[s].wins++;
      map[s].pnl += getRoi(t);
    });
    return Object.entries(map)
      .map(([setup, v]) => ({
        setup,
        winRate: v.total ? Math.round((v.wins / v.total) * 100) : 0,
        count: v.total,
        avgRoi: parseFloat((v.pnl / v.total).toFixed(2)),
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 3);
  }, [trades]);

  const dowData = useMemo(() => {
    const map: Record<number, { wins: number; total: number }> = {};
    trades.forEach((t) => {
      const day = getDay(new Date(t.created_at || t.date));
      if (!map[day]) map[day] = { wins: 0, total: 0 };
      map[day].total++;
      if (t.result === "win") map[day].wins++;
    });
    return DAYS.map((d, i) => ({
      day: d,
      winRate: map[i] ? Math.round((map[i].wins / map[i].total) * 100) : 0,
      count: map[i]?.total || 0,
    }));
  }, [trades]);

  const topSetup = setupData[0];
  const bestEmotion = emotionData[0];
  const worstEmotion = [...emotionData].sort(
    (a, b) => a.winRate - b.winRate,
  )[0];
  const bestDay = [...dowData].sort((a, b) => b.winRate - a.winRate)[0];
  const worstDay = [...dowData]
    .filter((d) => d.count > 0)
    .sort((a, b) => a.winRate - b.winRate)[0];

  const edgeScore = Math.min(
    100,
    Math.round(
      winRate * 0.4 +
        (Math.min(parseFloat(profitFactor as string) || 0, 3) / 3) * 40 +
        (Math.min(parseFloat(rr as string) || 0, 3) / 3) * 20,
    ),
  );
  const disciplineScore = Math.min(
    100,
    Math.round(
      (bestEmotion?.winRate || 0) * 0.6 +
        (bestStreak / Math.max(totalTrades, 1)) * 100 * 0.4,
    ),
  );
  const consistencyScore = Math.min(
    100,
    Math.round(
      100 - Math.min((worstStreak / Math.max(totalTrades, 1)) * 100, 50),
    ),
  );

  const generateAiInsights = async (isManual = false) => {
    if (isManual && lastGeneratedAt) {
      const hoursSince =
        (Date.now() - new Date(lastGeneratedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 2) {
        const minutesLeft = Math.ceil((2 - hoursSince) * 60);
        toast.error(
          `AI Coach is resting. Refresh available in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        );
        return;
      }
    }

    setAiLoading(true);
    setAiSections(null);

    try {
      const summary = {
        totalTrades,
        winRate: `${winRate.toFixed(1)}%`,
        totalPnL: totalPnL.toFixed(2),
        profitFactor,
        bestStreak,
        worstStreak,
        avgRoi: avgRoi.toFixed(2),
        rr,
        topSetups: setupData.slice(0, 5),
        emotionImpact: emotionData,
        bestDay: bestDay?.day,
        worstDay: worstDay?.day,
        monthlyPnL: monthlyData,
      };

      const prompt = `Analyze this trader's journal data and write a personalized coaching report.

TRADER DATA:
${JSON.stringify(summary, null, 2)}

Remember to follow the exact section format from your instructions. Be specific — reference their actual numbers, setups, and emotional patterns.`;

      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "API request failed");
      }

      const data = await response.json();
      const raw: string = data.result || "";
      if (!raw) throw new Error("Empty response from AI");

      const parse = (key: string, nextKey?: string): string => {
        const keyWithColon = `${key}:`;
        const startIdx = raw.indexOf(keyWithColon);
        if (startIdx === -1) return "";
        const contentStart = startIdx + keyWithColon.length;
        const content = raw.slice(contentStart);
        if (!nextKey) return content.trim();
        const nextKeyWithColon = `${nextKey}:`;
        const endIdx = content.indexOf(nextKeyWithColon);
        return endIdx === -1 ? content.trim() : content.slice(0, endIdx).trim();
      };

      const sections = {
        overview: parse("OVERVIEW", "WHAT YOU'RE DOING WELL"),
        strengths: parse(
          "WHAT YOU'RE DOING WELL",
          "WHAT'S HURTING YOUR PERFORMANCE",
        ),
        weaknesses: parse(
          "WHAT'S HURTING YOUR PERFORMANCE",
          "YOUR BEHAVIORAL PATTERNS",
        ),
        behavior: parse(
          "YOUR BEHAVIORAL PATTERNS",
          "MY RECOMMENDATION FOR YOU",
        ),
        recommendation: parse("MY RECOMMENDATION FOR YOU"),
      };

      if (!sections.overview)
        throw new Error("Response format was unexpected — retry.");

      const now = new Date().toISOString();

      // Save to Supabase
      await supabase
        .from("profiles")
        .update({
          ai_insights: raw,
          ai_insights_sections: sections,
          insights_generated_at: now,
          insights_trade_count: totalTrades,
        })
        .eq("id", userId);

      setAiSections(sections);
      setAiInsights(raw);
      setLastGeneratedAt(now);
      setLastTradeCount(totalTrades);
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate insights. Try again.");
      setAiInsights("");
      setAiSections(null);
    }

    setAiLoading(false);
  };
  const downloadReport = async () => {
    if (!aiSections) {
      toast.error("Generate a report first before downloading.");
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = margin;

      const checkPage = (needed: number) => {
        if (y + needed > pageH - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      const addText = (
        text: string,
        size: number,
        color: [number, number, number],
        bold = false,
      ) => {
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        const lines = pdf.splitTextToSize(text, contentW);
        checkPage(lines.length * (size * 0.4) + 4);
        pdf.text(lines, margin, y);
        y += lines.length * (size * 0.4) + 3;
      };

      const addSectionHeader = (
        title: string,
        r: number,
        g: number,
        b: number,
      ) => {
        checkPage(16);
        y += 5;
        pdf.setFillColor(r, g, b);
        pdf.rect(margin, y - 4, contentW, 10, "F");
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.text(title.toUpperCase(), margin + 4, y + 2);
        y += 10;
      };

      const addStatBox = (
        label: string,
        value: string,
        x: number,
        boxY: number,
        w: number,
      ) => {
        pdf.setFillColor(248, 249, 250);
        pdf.roundedRect(x, boxY, w, 16, 2, 2, "F");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.setFont("helvetica", "normal");
        pdf.text(label.toUpperCase(), x + 4, boxY + 6);
        pdf.setFontSize(12);
        pdf.setTextColor(22, 163, 74);
        pdf.setFont("helvetica", "bold");
        pdf.text(value, x + 4, boxY + 13);
      };

      pdf.setFillColor(22, 163, 74);
      pdf.rect(0, 0, pageW, 28, "F");
      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.text("Glint AI Coach Report", margin, 16);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Generated ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
        margin,
        23,
      );
      pdf.text("Pro Member", pageW - margin, 23, {
        align: "right",
      });
      y = 38;

      const stats = [
        { label: "Total Trades", value: String(totalTrades) },
        { label: "Win Rate", value: `${winRate.toFixed(1)}%` },
        {
          label: "Total P&L",
          value: `${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}%`,
        },
        { label: "Profit Factor", value: String(profitFactor) },
        { label: "Best Streak", value: `${bestStreak}W` },
        { label: "Worst Streak", value: `${worstStreak}L` },
        { label: "Avg ROI", value: `${avgRoi.toFixed(2)}%` },
        { label: "Avg R:R", value: String(rr) },
      ];
      const cols = 4;
      const boxW = (contentW - (cols - 1) * 4) / cols;
      stats.forEach((s, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        addStatBox(
          s.label,
          s.value,
          margin + col * (boxW + 4),
          y + row * 20,
          boxW,
        );
      });
      y += Math.ceil(stats.length / cols) * 20 + 8;

      [
        {
          title: "Coach Overview",
          content: aiSections.overview,
          r: 22,
          g: 163,
          b: 74,
        },
        {
          title: "What You Do Well",
          content: aiSections.strengths,
          r: 22,
          g: 163,
          b: 74,
        },
        {
          title: "What's Hurting Your Performance",
          content: aiSections.weaknesses,
          r: 220,
          g: 38,
          b: 38,
        },
        {
          title: "Your Behavioral Patterns",
          content: aiSections.behavior,
          r: 217,
          g: 119,
          b: 6,
        },
        {
          title: "This Week's Focus",
          content: aiSections.recommendation,
          r: 37,
          g: 99,
          b: 235,
        },
      ].forEach((s) => {
        addSectionHeader(s.title, s.r, s.g, s.b);
        y += 4;
        addText(s.content, 10, [55, 65, 81]);
        y += 2;
      });

      checkPage(30);
      y += 4;
      addSectionHeader("Key Insights", 37, 99, 235);
      y += 4;
      const insights = [
        { label: "Best Setup", value: topSetup?.setup || "—" },
        { label: "Best Emotion", value: bestEmotion?.emotion || "—" },
        { label: "Best Day", value: bestDay?.day || "—" },
        { label: "Avoid", value: worstDay?.day || "—" },
      ];
      const iBoxW = (contentW - 3 * 4) / 4;
      insights.forEach((s, i) => {
        addStatBox(s.label, s.value, margin + i * (iBoxW + 4), y, iBoxW);
      });
      y += 24;

      checkPage(12);
      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, y, pageW - margin, y);
      y += 6;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");
      pdf.text("Generated by Glint AI Coach · glint.app", margin, y);
      pdf.text("Keep improving — every trade is data.", pageW - margin, y, {
        align: "right",
      });

      pdf.save(`Glint-AI-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Report downloaded!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to download report.");
    }
  };

  if (checkingPro || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center">
        <div className="text-center mt-44">
          <Spinner size="3" />
        </div>
      </div>
    );
  }

  const resolvedIsPro = DEV_MODE ? true : isPro;
  const resolvedTradeCount = DEV_MODE ? DEV_TRADE_COUNT : totalTrades;

  if (!resolvedIsPro) return <LockedState />;
  if (resolvedTradeCount < MIN_TRADES)
    return <NotEnoughTrades count={resolvedTradeCount} />;

  return (
    <section className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Coach</h1>
              <p className="text-xs mt-0.5 text-muted-foreground hidden md:block">
                Your favorite coach
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={regenerateInsights}
              disabled={!aiSections || aiLoading}
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={downloadReport}
              disabled={!aiSections || aiLoading}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)] pointer-events-none" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Your Trading Profile
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold border ${
                  edgeScore >= 70
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : edgeScore >= 50
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-500"
                      : "border-border text-muted-foreground"
                }`}
              >
                {edgeScore >= 70
                  ? "Elite Tier"
                  : edgeScore >= 50
                    ? "Intermediate"
                    : "Building Edge"}
              </Badge>
            </div>

            <div className="flex flex-col items-center text-center md:text-left lg:flex-row gap-8">
              <div className="items-center justify-center gap-4 sm:gap-8 lg:gap-6 shrink-0 hidden md:flex text-foreground">
                <ScoreRing score={edgeScore} label="Edge Score" />
                <ScoreRing score={disciplineScore} label="Discipline" />
                <ScoreRing score={consistencyScore} label="Consistency" />
              </div>

              <div className="hidden lg:block w-px bg-border/60 self-stretch" />
              <div className="lg:hidden h-px w-full bg-border/60" />

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
                    {edgeScore >= 70
                      ? "Strong Edge Trader"
                      : edgeScore >= 50
                        ? "Developing Trader"
                        : "Early Stage Trader"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Based on {totalTrades} trades, here&apos;s where you stand
                    right now.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    {
                      label: "Win Rate",
                      value: `${winRate.toFixed(1)}%`,
                      positive: winRate >= 50,
                    },
                    {
                      label: "Profit Factor",
                      value: profitFactor,
                      positive: parseFloat(profitFactor as string) >= 1.5,
                    },
                    {
                      label: "Avg R:R",
                      value: rr,
                      positive: parseFloat(rr as string) >= 1.5,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl bg-muted/40 border border-border/60 px-3 py-2.5 text-center"
                    >
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        {s.label}
                      </p>
                      <p
                        className={`text-base font-extrabold ${
                          s.positive ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {topSetup && (
                    <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-[11px] font-semibold text-primary">
                        Best setup: {topSetup.setup}
                      </span>
                    </div>
                  )}
                  {bestEmotion && (
                    <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-[11px] font-semibold text-primary">
                        Best state: {bestEmotion.emotion}
                      </span>
                    </div>
                  )}
                  {bestDay && (
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Best day: {bestDay.day}
                      </span>
                    </div>
                  )}
                  {lastGeneratedAt && (
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                      <span className="text-[11px] text-muted-foreground">
                        Last generated -{" "}
                        {formatDistanceToNow(new Date(lastGeneratedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {aiLoading ? (
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Spinner size="3" className="text-primary" />
                <p className="text-sm font-semibold text-primary">
                  Analyzing...
                </p>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`h-4 ${i % 3 === 2 ? "w-2/3" : "w-full"}`}
                  />
                ))}
              </div>
            </div>
          ) : aiSections ? (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <p className="text-sm font-bold text-primary uppercase tracking-wider">
                    Coach Overview
                  </p>
                </div>
                <p className="text-foreground leading-relaxed">
                  {aiSections.overview}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-3xl border border-primary/20 bg-primary/5 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="text-sm font-bold text-primary uppercase tracking-wider">
                      What You Do Well
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiSections.strengths}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <p className="text-sm font-bold text-destructive uppercase tracking-wider">
                      What's Hurting You
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiSections.weaknesses}
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-amber-500" />
                  <p className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                    Your Behavioral Patterns
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiSections.behavior}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                    This Week's Focus
                  </p>
                </div>
                <p className="text-foreground leading-relaxed font-medium">
                  {aiSections.recommendation}
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-3">
              <Brain className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Click Refresh to generate your AI coaching report.
              </p>
              <Button
                size="sm"
                onClick={() => generateAiInsights(false)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" /> Generate Report
              </Button>
            </div>
          )}
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">
                    Emotional State Impact
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    How your mindset affects your win rate
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {emotionData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No emotion data yet
                </div>
              ) : (
                emotionData.map((e, i) => {
                  const isTop = i === 0;
                  const color =
                    EMOTION_COLORS[e.emotion.toLowerCase()] ||
                    "hsl(var(--primary))";
                  const isGood = e.winRate >= 60;
                  const isNeutral = e.winRate >= 40 && e.winRate < 60;
                  return (
                    <motion.div
                      key={e.emotion}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`rounded-2xl border p-4 space-y-3 ${
                        isTop
                          ? "border-primary/25 bg-primary/5"
                          : "border-border/60 bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {e.emotion}
                          </span>
                          {isTop && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
                              Best State
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm font-extrabold ${
                            isGood
                              ? "text-primary"
                              : isNeutral
                                ? "text-amber-500"
                                : "text-destructive"
                          }`}
                        >
                          {e.winRate}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          Win Rate{" "}
                          <span
                            className={`font-bold ${isGood ? "text-primary" : isNeutral ? "text-amber-500" : "text-destructive"}`}
                          >
                            {e.winRate}%
                          </span>
                        </span>
                        <span>·</span>
                        <span>
                          {e.count} trade{e.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${e.winRate}%` }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2 + i * 0.07,
                          }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card> */}

        {/* <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">
                    Day of Week Performance
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Best:{" "}
                    <span className="text-primary font-semibold">
                      {bestDay?.day} ({bestDay?.winRate}%)
                    </span>
                    {worstDay && (
                      <>
                        {" "}
                        · Worst:{" "}
                        <span className="text-destructive font-semibold">
                          {worstDay?.day} ({worstDay?.winRate}%)
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {dowData
                .filter((d) => d.count > 0)
                .sort((a, b) => b.winRate - a.winRate)
                .map((d, i) => {
                  const isTop = d.day === bestDay?.day;
                  const isWorst = d.day === worstDay?.day;
                  const isGood = d.winRate >= 60;
                  const isNeutral = d.winRate >= 40 && d.winRate < 60;
                  const barColor = isGood
                    ? "hsl(var(--primary))"
                    : isNeutral
                      ? "#f59e0b"
                      : "hsl(var(--destructive))";

                  return (
                    <motion.div
                      key={d.day}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`rounded-2xl border p-4 space-y-3 ${
                        isTop
                          ? "border-primary/25 bg-primary/5"
                          : isWorst
                            ? "border-destructive/20 bg-destructive/5"
                            : "border-border/60 bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {d.day}
                          </span>
                          {isTop && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
                              Best Day
                            </span>
                          )}
                          {isWorst && (
                            <span className="rounded-full bg-destructive px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-destructive-foreground">
                              Avoid
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm font-extrabold ${
                            isGood
                              ? "text-primary"
                              : isNeutral
                                ? "text-amber-500"
                                : "text-destructive"
                          }`}
                        >
                          {d.winRate}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          Win Rate{" "}
                          <span
                            className={`font-bold ${isGood ? "text-primary" : isNeutral ? "text-amber-500" : "text-destructive"}`}
                          >
                            {d.winRate}%
                          </span>
                        </span>
                        <span>·</span>
                        <span>
                          {d.count} trade{d.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.winRate}%` }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2 + i * 0.07,
                          }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: barColor }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              {dowData.filter((d) => d.count > 0).length === 0 && (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No day data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">
                    Top 3 Setup Performance
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Your highest-edge patterns ranked by win rate
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {setupData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No setup data yet
                </div>
              ) : (
                setupData.map((s, i) => {
                  const isTop = i === 0;
                  const isGood = s.winRate >= 60;
                  const isNeutral = s.winRate >= 40 && s.winRate < 60;
                  const barColor = isGood
                    ? "hsl(var(--primary))"
                    : isNeutral
                      ? "#f59e0b"
                      : "hsl(var(--destructive))";
                  const medals = ["🥇", "🥈", "🥉"];

                  return (
                    <motion.div
                      key={s.setup}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`rounded-2xl border p-4 space-y-3 ${
                        isTop
                          ? "border-primary/25 bg-primary/5"
                          : "border-border/60 bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">
                            {i < 3 ? (
                              medals[i]
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground w-5 text-center inline-block">
                                {i + 1}.
                              </span>
                            )}
                          </span>
                          <span className="text-sm font-bold text-foreground truncate">
                            {s.setup}
                          </span>
                          {isTop && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground shrink-0">
                              Best Setup
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm font-extrabold shrink-0 ml-3 ${
                            s.avgRoi >= 0 ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {s.avgRoi >= 0 ? "+" : ""}
                          {s.avgRoi}%
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>
                          Win Rate{" "}
                          <span
                            className={`font-bold ${
                              isGood
                                ? "text-primary"
                                : isNeutral
                                  ? "text-amber-500"
                                  : "text-destructive"
                            }`}
                          >
                            {s.winRate}%
                          </span>
                        </span>
                        <span>·</span>
                        <span>
                          {s.count} trade{s.count !== 1 ? "s" : ""}
                        </span>
                        <span>·</span>
                        <span>
                          Edge{" "}
                          <span
                            className={`font-bold ${
                              isGood
                                ? "text-primary"
                                : isNeutral
                                  ? "text-amber-500"
                                  : "text-destructive"
                            }`}
                          >
                            {isGood ? "Strong" : isNeutral ? "Neutral" : "Weak"}
                          </span>
                        </span>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.winRate}%` }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2 + i * 0.07,
                          }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: barColor }}
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            {
              label: "Best emotion",
              value: bestEmotion?.emotion || "—",
              sub: `${bestEmotion?.winRate || 0}% win rate`,
              icon: CheckCircle2,
              color: "text-primary",
            },
            {
              label: "Worst emotion",
              value: worstEmotion?.emotion || "—",
              sub: `${worstEmotion?.winRate || 0}% win rate`,
              icon: AlertTriangle,
              color: "text-destructive",
            },
            {
              label: "Best day",
              value: bestDay?.day || "—",
              sub: `${bestDay?.winRate || 0}% win rate`,
              icon: Flame,
              color: "text-primary",
            },
            {
              label: "Avoid trading",
              value: worstDay?.day || "—",
              sub: `${worstDay?.winRate || 0}% win rate`,
              icon: Clock,
              color: "text-destructive",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
              <p className="text-base font-extrabold text-foreground">
                {s.value}
              </p>
              <p className={`text-xs font-semibold ${s.color}`}>{s.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
