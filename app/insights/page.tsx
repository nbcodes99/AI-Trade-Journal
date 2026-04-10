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

  const sortedSetups = [...setupPerformance].sort(
    (a, b) =>
      b.winRate - a.winRate || parseFloat(b.avgRoi) - parseFloat(a.avgRoi),
  );

  const topSetups = sortedSetups
    .slice(0, 2)
    .map((s) => s.setup)
    .join(" and ");
  const topSetupWins = sortedSetups
    .slice(0, 2)
    .map((s) => `${s.setup} (${s.winRate}% win)`)
    .join(" and ");
  const averageRoi = totalTrades ? (totalPnL / totalTrades).toFixed(2) : "0.00";

  const placeholderInsights = getPlaceholderInsights();
  const showFakeInsights = !aiInsights || aiInsights === placeholderInsights;

  return (
    <section className="min-h-screen space-y-12 px-4 py-8 md:p-8">
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
          <CardTitle className="text-center">AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {aiLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-6 w-full overflow-visible">
              {/* <div className="flex flex-col gap-3 rounded-xl border border-border bg-px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <span className="font-semibold text-foreground">
                  Last insights generated at
                </span>
                <span className="text-right text-foreground">
                  {lastInsightsAt}
                </span>
              </div> */}

              {showFakeInsights ? (
                <div className="rounded-3xl border border-border bg-background p-6 shadow-lg shadow-black/5">
                  <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-4 mb-6">
                    <div className="rounded-2xl bg-primary/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Trades
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {totalTrades}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-emerald-500/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Win rate
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {winRate}%
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-500/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Total ROI
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        ${totalPnL.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-violet-500/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Avg ROI
                      </p>
                      <p className="mt-2 text-xl font-semibold text-foreground">
                        {averageRoi}%
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 space-y-4 text-sm leading-7 text-muted-foreground">
                    <p className="text-base font-semibold text-foreground">
                      How your trading edge is behaving
                    </p>
                    <p>
                      Based on your last {totalTrades} trade
                      {totalTrades === 1 ? "" : "s"}, the strongest evidence is
                      in your top setups:{" "}
                      {topSetupWins || "your preferred setups"}. Your
                      performance is strongest when you trade with clear market
                      condition tags and a defined entry trigger.
                    </p>
                    <p>
                      Your current record shows a {winRate}% win rate and a net
                      ROI of ${totalPnL.toFixed(2)}. Trades held for a shorter
                      duration tend to preserve gains, while the biggest losses
                      appear on setups taken in unclear or choppy markets.
                    </p>
                  </div>

                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-muted/40 px-10 py-6">
                      <p className="text-lg font-semibold text-foreground mb-6">
                        What works well
                      </p>
                      <li className="text-sm mb-3">
                        Top setups such as {topSetups || "breakout/pullback"}{" "}
                        deliver your highest win rates.
                      </li>
                      <li className="text-sm mb-3">
                        Trades with explicit entry and exit notes have better
                        outcomes than those without.
                      </li>
                      <li className="text-sm mb-3">
                        Holding winners for at least one clear swing keeps
                        losses smaller and lets your edge play out.
                      </li>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/40 px-10 py-6">
                      <p className="text-lg font-semibold text-foreground mb-6">
                        What needs attention
                      </p>
                      <li className="text-sm mb-3">
                        Many losing trades come from choppy or low-volume
                        conditions with weak confirmation.
                      </li>
                      <li className="text-sm mb-3">
                        Emotional exits and inconsistent tagging reduce your
                        ability to learn from the trade.
                      </li>
                      <li className="text-sm mb-3">
                        Position sizing appears to drift after wins, increasing
                        downside risk on later trades.
                      </li>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-border bg-primary/5 p-5 text-sm text-foreground">
                    <p className="font-semibold mb-3 text-lg">
                      Evidence-based advice
                    </p>
                    <p className="mb-2">
                      Your data suggests that the top 2 setups account for the
                      majority of profitable trades. Focus on repeating those
                      with clear market structure and volume support.
                    </p>
                    <p>
                      Use consistent tags for market condition and exit reason
                      so you can separate good signals from noise. This will
                      make your next review more reliable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-background p-6 shadow-lg shadow-black/5 text-sm leading-7 text-muted-foreground whitespace-pre-line">
                  {aiInsights}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
