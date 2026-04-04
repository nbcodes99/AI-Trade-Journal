"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

const chartConfig = {
  value: { label: "Value" },
  winRate: { label: "Win Rate" },
};

export default function Insights() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [lastInsightsAt, setLastInsightsAt] =
    useState<string>("Not generated yet");

  useEffect(() => {
    if (!userId) return;

    const fetchTrades = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        setTrades([]);
      } else {
        setTrades(data || []);
      }
      setLoading(false);
    };

    fetchTrades();
  }, [userId]);

  useEffect(() => {
    if (trades.length > 0 && !loading) {
      generateAiInsights();
    }
  }, [trades, loading]);

  const getPlaceholderInsights = () => {
    if (totalTrades === 0) {
      return (
        "No trade history yet. Log your first few trades to see tailored insights here. " +
        "Once you have a few entries, this card will show your performance patterns."
      );
    }

    return (
      `Your recent trading set has ${totalTrades} trade${
        totalTrades === 1 ? "" : "s"
      } with a ${winRate}% win rate and a total P&L of ${totalPnL.toFixed(2)}. ` +
      "Add 5 more trades to refresh your insights and uncover stronger setup trends. " +
      "Look for consistent winners, watch emotional trade decisions, and keep refining your risk management."
    );
  };

  const generateAiInsights = async () => {
    setAiLoading(true);
    try {
      const summary = {
        totalTrades,
        winRate: `${winRate}%`,
        totalPnL: `$${totalPnL.toFixed(2)}`,
        avgDuration: `${avgDuration.toFixed(1)} days`,
        topSetups: setupPerformance.slice(0, 5),
        emotionImpact: emotionData,
        monthlyPnL: monthlyData,
      };

      const prompt = `
Analyze this trading data and provide insights on patterns, strengths, weaknesses, and actionable advice. Focus on:
- Behavioral patterns and emotional impact
- Setup performance and consistency
- Time-based performance (daily/weekly trends if available)
- Risk management and edge identification
- Recommendations for improvement

Data Summary:
${JSON.stringify(summary, null, 2)}

Provide a clear, concise analysis in 3-4 paragraphs.
`;

      const response = await fetch("/api/hf-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate insights");
      }

      const insights = data.result || getPlaceholderInsights();
      setAiInsights(insights);
      setLastInsightsAt(new Date().toLocaleString());
    } catch (error) {
      console.error("AI Insights error:", error);
      setAiInsights(getPlaceholderInsights());
      setLastInsightsAt(new Date().toLocaleString());
    }
    setAiLoading(false);
  };

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : "0.0";

  const totalPnL = trades.reduce((acc, t) => {
    const roi = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return acc + (isNaN(roi) ? 0 : roi);
  }, 0);

  const avgDuration = trades.length
    ? trades.reduce((acc, t) => {
        if (t.entry && t.exit) {
          const entry = new Date(t.entry);
          const exit = new Date(t.exit);
          return (
            acc + (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
        return acc;
      }, 0) / trades.length
    : 0;

  const monthlyPnL = trades.reduce((acc: any, t) => {
    const month = format(new Date(t.created_at), "yyyy-MM");
    const roi = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    acc[month] = (acc[month] || 0) + (isNaN(roi) ? 0 : roi);
    return acc;
  }, {});

  const monthlyData = Object.entries(monthlyPnL).map(([month, pnl]) => ({
    month,
    pnl,
  }));

  const emotionData = Object.values(
    trades.reduce((acc: any, t) => {
      const emotion = t.emotion || "Unknown";
      if (!acc[emotion]) acc[emotion] = { emotion, wins: 0, total: 0 };
      acc[emotion].total++;
      if (t.result === "win") acc[emotion].wins++;
      return acc;
    }, {}),
  ).map((e: any) => ({
    emotion: e.emotion,
    winRate: e.total ? Math.round((e.wins / e.total) * 100) : 0,
  }));

  const setupPerformance = Object.values(
    trades.reduce((acc: any, t) => {
      const setup = t.setup || "Unknown";
      if (!acc[setup]) acc[setup] = { setup, wins: 0, total: 0, avgRoi: 0 };
      acc[setup].total++;
      if (t.result === "win") acc[setup].wins++;
      const roi = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
      acc[setup].avgRoi += isNaN(roi) ? 0 : roi;
      return acc;
    }, {}),
  ).map((s: any) => ({
    setup: s.setup,
    winRate: s.total ? Math.round((s.wins / s.total) * 100) : 0,
    avgRoi: s.total ? (s.avgRoi / s.total).toFixed(2) : "0.00",
  }));

  const placeholderInsights = getPlaceholderInsights();
  const showFakeInsights = !aiInsights || aiInsights === placeholderInsights;

  return (
    <section className="min-h-screen p-8 space-y-12">
      <h1 className="text-3xl text-center font-bold my-6">Trading Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly P&L</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="pnl" stroke="#4ade80" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win Rate by Emotion</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={emotionData}>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis dataKey="emotion" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="winRate" fill="#4d7c0f" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {aiLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground hidden md:flex">
                <span>Last insights generated at</span>
                <span className="font-semibold text-foreground">
                  {lastInsightsAt}
                </span>
              </div>

              {showFakeInsights ? (
                <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        How you trade
                      </p>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {totalTrades} trade{totalTrades === 1 ? "" : "s"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Confidence: Low
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">
                    You trade a small set of repeatable setups, usually tagging
                    market condition and emotion inconsistently. Your trades
                    show a {winRate}% win rate and a total P&L of $
                    {totalPnL.toFixed(2)} — wins cluster around clear
                    confluences, while losses often happen in choppy markets or
                    when exits are emotion-driven.
                  </p>

                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    What you're doing wrong
                  </h4>
                  <ul className="mb-4 list-inside list-disc text-sm text-muted-foreground space-y-1">
                    <li>
                      <span className="font-medium text-foreground">
                        Inconsistent tagging
                      </span>{" "}
                      — market condition and exit reason are missing on many
                      trades, reducing analysis quality.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Premature exits
                      </span>{" "}
                      — winners are often cut short instead of holding to the
                      first target.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Position sizing drift
                      </span>{" "}
                      — size increases after wins and during streaks, amplifying
                      drawdowns.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Trading in choppy markets
                      </span>{" "}
                      — taking setups without clear volume or trend
                      confirmation.
                    </li>
                  </ul>

                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    What's working for you
                  </h4>
                  <ul className="mb-4 list-inside list-disc text-sm text-muted-foreground space-y-1">
                    <li>
                      <span className="font-medium text-foreground">
                        Top setups
                      </span>{" "}
                      — {setupPerformance?.[0]?.setup ?? "trend/breakout"} and{" "}
                      {setupPerformance?.[1]?.setup ?? "pullback"} show the best
                      win rates in your history.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Clear confluences
                      </span>{" "}
                      — trades with multiple confirmations (trend + volume +
                      structure) are your most profitable.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Short holding periods
                      </span>{" "}
                      — your quicker trades limit exposure and preserve capital
                      when the edge is small.
                    </li>
                  </ul>

                  <div className="rounded-lg bg-muted/20 p-3 text-sm text-foreground">
                    <p className="font-semibold mb-2">
                      Quick fixes (apply now)
                    </p>
                    <ul className="list-inside list-decimal text-muted-foreground space-y-1">
                      <li>
                        Always tag market condition and exit reason for every
                        trade.
                      </li>
                      <li>
                        Adopt a simple exit rule: hold winners to first target
                        unless invalidated.
                      </li>
                      <li>
                        Cap position size after 2 consecutive losses until you
                        record 2 clean wins.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {aiInsights}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
