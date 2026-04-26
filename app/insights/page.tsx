"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Cell,
} from "recharts";
import { format, startOfWeek, getDay } from "date-fns";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  BarChart2,
  Zap,
  Shield,
} from "lucide-react";

const chartConfig = {
  value: { label: "Value" },
  winRate: { label: "Win Rate %" },
  pnl: { label: "P&L" },
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EMOTION_COLORS: Record<string, string> = {
  calm: "#16a34a",
  confident: "#2563eb",
  fearful: "#dc2626",
  greedy: "#d97706",
  neutral: "#6b7280",
  anxious: "#9333ea",
  excited: "#0891b2",
};

export default function Insights() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchTrades = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      setTrades(error ? [] : data || []);
      setLoading(false);
    };
    fetchTrades();
  }, [userId]);

  useEffect(() => {
    if (trades.length > 0 && !loading) generateAiInsights();
  }, [trades, loading]);

  const getRoi = (t: any) => {
    const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return isNaN(r) ? 0 : r;
  };

  // Core stats
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const breakevens = trades.filter((t) => t.result === "breakeven").length;
  const winRate = totalTrades ? (wins / totalTrades) * 100 : 0;
  const totalPnL = trades.reduce((a, t) => a + getRoi(t), 0);
  const avgRoi = totalTrades ? totalPnL / totalTrades : 0;
  const allRois = trades.map(getRoi);
  const bestTrade = allRois.length ? Math.max(...allRois) : 0;
  const worstTrade = allRois.length ? Math.min(...allRois) : 0;

  // Profit factor
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

  // Win/loss streaks
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

  // Monthly P&L
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

  // Emotion analysis
  const emotionData = useMemo(() => {
    const map: Record<string, { wins: number; total: number; pnl: number }> =
      {};
    trades.forEach((t) => {
      const e = (t.emotion || "Unknown").toLowerCase();
      if (!map[e]) map[e] = { wins: 0, total: 0, pnl: 0 };
      map[e].total++;
      if (t.result === "win") map[e].wins++;
      map[e].pnl += getRoi(t);
    });
    return Object.entries(map)
      .map(([emotion, v]) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        winRate: v.total ? Math.round((v.wins / v.total) * 100) : 0,
        count: v.total,
        pnl: parseFloat(v.pnl.toFixed(2)),
      }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [trades]);

  // Setup performance
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
      .sort((a, b) => b.winRate - a.winRate);
  }, [trades]);

  // Day of week analysis
  const dowData = useMemo(() => {
    const map: Record<number, { wins: number; total: number; pnl: number }> =
      {};
    trades.forEach((t) => {
      const day = getDay(new Date(t.created_at || t.date));
      if (!map[day]) map[day] = { wins: 0, total: 0, pnl: 0 };
      map[day].total++;
      if (t.result === "win") map[day].wins++;
      map[day].pnl += getRoi(t);
    });
    return DAYS.map((d, i) => ({
      day: d,
      winRate: map[i] ? Math.round((map[i].wins / map[i].total) * 100) : 0,
      count: map[i]?.total || 0,
      pnl: map[i] ? parseFloat(map[i].pnl.toFixed(2)) : 0,
    }));
  }, [trades]);

  // Drawdown
  const drawdownData = useMemo(() => {
    let peak = 0,
      equity = 0;
    return trades.map((t, i) => {
      equity += getRoi(t);
      peak = Math.max(peak, equity);
      const dd = peak > 0 ? ((equity - peak) / peak) * 100 : 0;
      return {
        trade: i + 1,
        drawdown: parseFloat(dd.toFixed(2)),
        equity: parseFloat(equity.toFixed(2)),
      };
    });
  }, [trades]);

  const maxDrawdown = drawdownData.length
    ? Math.min(...drawdownData.map((d) => d.drawdown))
    : 0;

  // Risk/reward
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

  const generateAiInsights = async () => {
    setAiLoading(true);
    try {
      const summary = {
        totalTrades,
        winRate: `${winRate.toFixed(1)}%`,
        totalPnL: totalPnL.toFixed(2),
        topSetups: setupData.slice(0, 5),
        emotionImpact: emotionData,
        monthlyPnL: monthlyData,
        profitFactor,
        bestStreak,
        worstStreak,
        avgRoi: avgRoi.toFixed(2),
      };
      const prompt = `Analyze this trader's data and give 3-4 paragraphs of sharp, specific insights: behavioral patterns, setup edge, risk management, and one concrete improvement recommendation. Be direct and data-driven.\n\nData:\n${JSON.stringify(summary, null, 2)}`;
      const response = await fetch("/api/hf-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setAiInsights(data.result || "");
    } catch {
      setAiInsights("");
    }
    setAiLoading(false);
  };

  const topSetup = setupData[0];
  const bestEmotion = emotionData[0];
  const bestDay = [...dowData].sort((a, b) => b.winRate - a.winRate)[0];

  const SkeletonCard = () => (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );

  return (
    <section className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Trading Insights
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deep analytics on your trading behavior & performance
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={generateAiInsights}
            disabled={aiLoading || loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${aiLoading ? "animate-spin" : ""}`}
            />
            Refresh AI
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            {
              label: "Win Rate",
              value: loading ? null : `${winRate.toFixed(1)}%`,
              icon: Target,
              color: winRate >= 50 ? "text-primary" : "text-destructive",
            },
            {
              label: "Total P&L",
              value: loading
                ? null
                : `${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}%`,
              icon: TrendingUp,
              color: totalPnL >= 0 ? "text-primary" : "text-destructive",
            },
            {
              label: "Profit Factor",
              value: loading ? null : profitFactor,
              icon: BarChart2,
              color:
                parseFloat(profitFactor as string) >= 1.5
                  ? "text-primary"
                  : "text-amber-500",
            },
            {
              label: "Avg R:R",
              value: loading ? null : rr,
              icon: Shield,
              color: "text-foreground",
            },
            {
              label: "Best Streak",
              value: loading ? null : `${bestStreak}W`,
              icon: Flame,
              color: "text-primary",
            },
            {
              label: "Max Drawdown",
              value: loading ? null : `${maxDrawdown.toFixed(1)}%`,
              icon: AlertTriangle,
              color: "text-destructive",
            },
            {
              label: "Best Trade",
              value: loading ? null : `+${bestTrade.toFixed(2)}%`,
              icon: Zap,
              color: "text-primary",
            },
            {
              label: "Worst Trade",
              value: loading ? null : `${worstTrade.toFixed(2)}%`,
              icon: TrendingDown,
              color: "text-destructive",
            },
          ].map((s) => (
            <Card key={s.label} className="border-border col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                  <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
                {loading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className={`text-xl font-extrabold ${s.color}`}>
                    {s.value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly P&L + Drawdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Monthly P&L</CardTitle>
              <p className="text-xs text-muted-foreground">
                Cumulative return by month
              </p>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : monthlyData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No data yet
                </div>
              ) : (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData} barSize={28}>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {monthlyData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              entry.pnl >= 0
                                ? "hsl(var(--primary))"
                                : "hsl(var(--destructive))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                Drawdown Curve
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Max drawdown:{" "}
                <span className="text-destructive font-semibold">
                  {maxDrawdown.toFixed(1)}%
                </span>
              </p>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : drawdownData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No data yet
                </div>
              ) : (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart
                      data={drawdownData}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--destructive))"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--destructive))"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="hsl(var(--border))"
                        strokeOpacity={0.4}
                      />
                      <XAxis
                        dataKey="trade"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="drawdown"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={1.5}
                        fill="url(#ddGrad)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emotion + Day of Week */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                Win Rate by Emotion
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Best emotional state:{" "}
                <span className="text-primary font-semibold">
                  {bestEmotion?.emotion || "—"} ({bestEmotion?.winRate || 0}%)
                </span>
              </p>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : emotionData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No emotion data
                </div>
              ) : (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={emotionData} barSize={32} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="hsl(var(--border))"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        unit="%"
                      />
                      <YAxis
                        type="category"
                        dataKey="emotion"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={70}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
                        {emotionData.map((e, i) => (
                          <Cell
                            key={i}
                            fill={
                              EMOTION_COLORS[e.emotion.toLowerCase()] ||
                              "hsl(var(--primary))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                Performance by Day of Week
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Best day:{" "}
                <span className="text-primary font-semibold">
                  {bestDay?.day || "—"} ({bestDay?.winRate || 0}% WR)
                </span>
              </p>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dowData} barSize={28}>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        unit="%"
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                        {dowData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={
                              d.winRate >= 60
                                ? "hsl(var(--primary))"
                                : d.winRate >= 40
                                  ? "hsl(var(--muted-foreground))"
                                  : "hsl(var(--destructive))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Setup Performance Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">
              Setup Performance Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Ranked by win rate — your highest-edge setups
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : setupData.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No setup data yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Setup
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Trades
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Win Rate
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Avg ROI
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Edge
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {setupData.map((s, i) => (
                      <tr
                        key={s.setup}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-semibold text-foreground flex items-center gap-2">
                          {i === 0 && <span className="text-xs">🥇</span>}
                          {i === 1 && <span className="text-xs">🥈</span>}
                          {i === 2 && <span className="text-xs">🥉</span>}
                          {i > 2 && (
                            <span className="text-xs text-muted-foreground w-4">
                              {i + 1}.
                            </span>
                          )}
                          {s.setup}
                        </td>
                        <td className="px-4 py-3.5 text-center text-muted-foreground">
                          {s.count}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`font-bold ${s.winRate >= 60 ? "text-primary" : s.winRate >= 40 ? "text-amber-500" : "text-destructive"}`}
                          >
                            {s.winRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`font-bold ${s.avgRoi >= 0 ? "text-primary" : "text-destructive"}`}
                          >
                            {s.avgRoi >= 0 ? "+" : ""}
                            {s.avgRoi}%
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[120px]">
                              <div
                                className={`h-full rounded-full ${s.winRate >= 60 ? "bg-primary" : s.winRate >= 40 ? "bg-amber-500" : "bg-destructive"}`}
                                style={{ width: `${s.winRate}%` }}
                              />
                            </div>
                            <Badge
                              variant={
                                s.winRate >= 60
                                  ? "default"
                                  : s.winRate >= 40
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {s.winRate >= 60
                                ? "Strong"
                                : s.winRate >= 40
                                  ? "Neutral"
                                  : "Weak"}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Insight Chips */}
        {!loading && totalTrades > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">
                  Best Setup
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">
                    {topSetup?.setup || "—"}
                  </span>{" "}
                  leads with a{" "}
                  <span className="text-primary font-bold">
                    {topSetup?.winRate || 0}%
                  </span>{" "}
                  win rate across {topSetup?.count || 0} trades.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
              <Brain className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">
                  Emotion Edge
                </p>
                <p className="text-sm text-muted-foreground">
                  You trade best when feeling{" "}
                  <span className="text-foreground font-semibold">
                    {bestEmotion?.emotion || "—"}
                  </span>{" "}
                  with a{" "}
                  <span className="text-amber-500 font-bold">
                    {bestEmotion?.winRate || 0}%
                  </span>{" "}
                  win rate.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">
                  Best Day
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">
                    {bestDay?.day || "—"}
                  </span>{" "}
                  is your strongest day with a{" "}
                  <span className="font-bold text-foreground">
                    {bestDay?.winRate || 0}%
                  </span>{" "}
                  win rate and {bestDay?.count || 0} trades.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Coach Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">
                  AI Coach Analysis
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Personalized insights based on your full trade history
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`h-4 ${i % 3 === 2 ? "w-3/4" : "w-full"}`}
                  />
                ))}
              </div>
            ) : aiInsights ? (
              <div className="rounded-xl bg-muted/30 border border-border p-5 text-sm leading-7 text-muted-foreground whitespace-pre-line">
                {aiInsights}
              </div>
            ) : totalTrades === 0 ? (
              <div className="rounded-xl bg-muted/30 border border-border p-5 text-sm text-muted-foreground text-center">
                Log at least 5 trades to unlock your personalized AI coaching
                report.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-muted/30 border border-border p-5 space-y-4 text-sm text-muted-foreground leading-7">
                  <p>
                    Across your{" "}
                    <span className="text-foreground font-semibold">
                      {totalTrades} trades
                    </span>
                    , your win rate sits at{" "}
                    <span
                      className={`font-bold ${winRate >= 50 ? "text-primary" : "text-destructive"}`}
                    >
                      {winRate.toFixed(1)}%
                    </span>{" "}
                    with a profit factor of{" "}
                    <span className="text-foreground font-semibold">
                      {profitFactor}
                    </span>
                    . Your average R:R is{" "}
                    <span className="text-foreground font-semibold">{rr}</span>{" "}
                    —{" "}
                    {parseFloat(rr as string) >= 1.5
                      ? "a solid edge"
                      : "room to improve on letting winners run"}
                    .
                  </p>
                  <p>
                    Your best setup —{" "}
                    <span className="text-foreground font-semibold">
                      {topSetup?.setup || "your top pattern"}
                    </span>{" "}
                    — delivers a{" "}
                    <span className="text-primary font-bold">
                      {topSetup?.winRate || 0}%
                    </span>{" "}
                    win rate. Focus there. Your best mental state is{" "}
                    <span className="text-foreground font-semibold">
                      {bestEmotion?.emotion || "—"}
                    </span>
                    , while your worst day of the week shows the lowest win
                    rates — consider reducing size or skipping those sessions.
                  </p>
                  <p>
                    Your max drawdown is{" "}
                    <span className="text-destructive font-bold">
                      {maxDrawdown.toFixed(1)}%
                    </span>{" "}
                    and your best streak was{" "}
                    <span className="text-primary font-bold">
                      {bestStreak} consecutive wins
                    </span>
                    . To protect capital, define a daily loss limit and stick to
                    it — your data shows recovery after streaks is slower than
                    your drawdowns.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
