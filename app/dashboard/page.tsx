"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { format, subWeeks, subMonths, subYears } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  BarChart2,
  Award,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { buildEquityCurve, calcAllStats } from "@/lib/tradeCalculations";

const chartConfig = {
  value: { label: "Value" },
  winRate: { label: "Win Rate" },
};

const TIMEFRAMES = ["All", "1W", "2W", "1M", "1Y"];
const pieColors = ["#16a34a", "#ef4444"];

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorClass,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  colorClass?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${colorClass || ""}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              trend === "up"
                ? "bg-primary/15 text-primary"
                : trend === "down"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-primary" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 text-destructive" />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("All");
  const [isPro, setIsPro] = useState(false);

  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const userN =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.user_metadata?.given_name ||
    null;

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      setUserName(
        data?.full_name || session?.user?.user_metadata?.full_name || null,
      );
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const nameFromMeta = userName || null;
      setUserName(nameFromMeta);

      const profileRes = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();

      setIsPro(profileRes.data?.plan === "pro");

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

  const getFilteredTrades = () => {
    if (timeframe === "All") return trades;

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case "1W":
        startDate = subWeeks(now, 1);
        break;
      case "2W":
        startDate = subWeeks(now, 2);
        break;
      case "1M":
        startDate = subMonths(now, 1);
        break;
      case "1Y":
        startDate = subYears(now, 1);
        break;
      default:
        return trades;
    }

    return trades.filter((t) => new Date(t.created_at || t.date) >= startDate);
  };
  // const formatMoney = (value: number) => {
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   }).format(value);
  // };
  const filteredTrades = getFilteredTrades();

  const stats = useMemo(() => calcAllStats(filteredTrades), [filteredTrades]);
  const equityData = useMemo(
    () => buildEquityCurve(filteredTrades),
    [filteredTrades],
  );
  const recentTrades = useMemo(
    () => [...trades].reverse().slice(0, 5),
    [trades],
  );

  const totalRoiPositive = stats.totalRoi >= 0;

  const getRoi = (t: any) => {
    const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return isNaN(r) ? 0 : r;
  };

  const getPnl = (t: any) => {
    const p = typeof t.pnl === "string" ? parseFloat(t.pnl) : t.pnl;
    return isNaN(p) ? 0 : p;
  };

  const totalTrades = filteredTrades.length;

  const wins = filteredTrades.filter((t) => t.result === "win").length;
  const losses = filteredTrades.filter((t) => t.result === "loss").length;

  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : "0.0";
  const totalPnL = filteredTrades.reduce((acc, t) => acc + getPnl(t), 0);

  const totalROI = filteredTrades.reduce((acc, t) => acc + getRoi(t), 0);

  const averageROI = totalTrades ? (totalROI / totalTrades).toFixed(2) : "0.00";
  const allRois = filteredTrades.map(getRoi);
  const bestTrade = allRois.length ? Math.max(...allRois) : 0;

  let currentStreak = 0,
    bestStreak = 0,
    tempStreak = 0;
  filteredTrades.forEach((t) => {
    if (t.result === "win") {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });
  for (let i = filteredTrades.length - 1; i >= 0; i--) {
    if (filteredTrades[i].result === "win") currentStreak++;
    else break;
  }

  const winLossData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];

  const setupData = Object.values(
    filteredTrades.reduce((acc: any, t) => {
      const key = t.setup || "Unknown";
      if (!acc[key]) acc[key] = { setup: key, count: 0, wins: 0 };
      acc[key].count++;
      if (t.result === "win") acc[key].wins++;
      return acc;
    }, {}),
  ).map((s: any) => ({
    setup: s.setup,
    winRate: s.count ? Math.round((s.wins / s.count) * 100) : 0,
    count: s.count,
  }));

  const pnlPositive = totalPnL >= 0;
  const winRateNum = parseFloat(winRate);

  const EquityTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-border bg-background backdrop-blur-sm px-3 py-2 shadow-lg text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="font-bold text-primary">
          {payload[0].value >= 0 ? "+" : ""}
          {payload[0].value?.toFixed(2)}%
        </p>
      </div>
    );
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <section className="min-h-screen bg-background">
        <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-2xl mb-6 md:mb-0 font-bold text-foreground">
                {greeting()},{" "}
                <span className="text-primary">
                  {loading ? (
                    <Skeleton className="inline-block h-5 w-24 align-middle" />
                  ) : (
                    userName?.split(" ")[0] || "Trader"
                  )}
                </span>{" "}
                👋🏼
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(), "EEEE, MMMM d yyyy")} · Here's your trading
                overview
              </p>
            </div>

            <div className="inline-flex h-9 items-center rounded-lg bg-muted/50 p-1 border border-border/50 justify-center">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    timeframe === tf
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="grid lg:grid-cols-4 gap-4 grid-cols-1">
            <StatCard
              title="Total Trades"
              value={totalTrades}
              subtitle="in selected period"
              icon={Activity}
              trend="neutral"
              loading={loading}
            />
            <StatCard
              title="Win Rate"
              value={loading ? "—" : `${stats.winRate.toFixed(1)}%`}
              subtitle={`${wins}W / ${losses}L`}
              icon={Target}
              trend={stats.winRate >= 50 ? "up" : "down"}
              loading={loading}
            />
            <StatCard
              title="Total ROI"
              value={
                loading
                  ? "—"
                  : `${totalRoiPositive ? "+" : ""}${stats.totalRoi.toFixed(2)}%`
              }
              subtitle="Cumulative return"
              icon={DollarSign}
              trend={totalRoiPositive ? "up" : "down"}
              loading={loading}
            />
            <StatCard
              title="Best Trade"
              value={loading ? "—" : `+${stats.bestTrade.toFixed(2)}%`}
              subtitle="Highest single return"
              icon={Award}
              trend="up"
              loading={loading}
            />
          </div>

          {isPro ? (
            <div className="grid lg:grid-cols-4 gap-4 grid-cols-1">
              <StatCard
                title="Expectancy"
                // value={
                //   loading
                //     ? "—"
                //     : (() => {
                //         const avgWin =
                //           wins > 0
                //             ? filteredTrades
                //                 .filter((t) => t.result === "win")
                //                 .reduce((a, t) => a + getRoi(t), 0) / wins
                //             : 0;
                //         const avgLoss =
                //           losses > 0
                //             ? Math.abs(
                //                 filteredTrades
                //                   .filter((t) => t.result === "loss")
                //                   .reduce((a, t) => a + getRoi(t), 0) / losses,
                //               )
                //             : 0;
                //         const winPct = totalTrades ? wins / totalTrades : 0;
                //         const lossPct = totalTrades ? losses / totalTrades : 0;
                //         const expectancy = winPct * avgWin - lossPct * avgLoss;
                //         return `${expectancy >= 0 ? "+" : ""}${expectancy.toFixed(2)}%`;
                //       })()
                // }
                value={
                  loading
                    ? "—"
                    : `${stats.expectancy >= 0 ? "+" : ""}${stats.expectancy.toFixed(2)}%`
                }
                subtitle="Avg edge per trade"
                icon={TrendingUp}
                trend={stats.expectancy >= 0 ? "up" : "down"}
                loading={loading}
              />
              <StatCard
                title="Max Drawdown"
                value={
                  loading
                    ? "—"
                    : (() => {
                        let peak = 0,
                          equity = 0,
                          maxDD = 0;
                        filteredTrades.forEach((t) => {
                          equity += getRoi(t);
                          peak = Math.max(peak, equity);
                          const dd =
                            peak > 0 ? ((peak - equity) / peak) * 100 : 0;
                          maxDD = Math.max(maxDD, dd);
                        });
                        return `-${maxDD.toFixed(2)}%`;
                      })()
                }
                // value={loading ? "—" : `-${stats.maxDrawdown.toFixed(2)}%`}
                subtitle="Deepest peak-to-trough"
                icon={AlertTriangle}
                trend="down"
                loading={loading}
              />
              <StatCard
                title="Avg R:R Ratio"
                // value={
                //   loading
                //     ? "—"
                //     : (() => {
                //         const avgWin =
                //           wins > 0
                //             ? filteredTrades
                //                 .filter((t) => t.result === "win")
                //                 .reduce((a, t) => a + getRoi(t), 0) / wins
                //             : 0;
                //         const avgLoss =
                //           losses > 0
                //             ? Math.abs(
                //                 filteredTrades
                //                   .filter((t) => t.result === "loss")
                //                   .reduce((a, t) => a + getRoi(t), 0) / losses,
                //               )
                //             : 0;
                //         return avgLoss > 0
                //           ? `${(avgWin / avgLoss).toFixed(2)}R`
                //           : "—";
                //       })()
                // }
                value={loading ? "—" : `${stats.avgRR}R`}
                subtitle="Avg winner vs avg loser"
                icon={BarChart2}
                trend={parseFloat(stats.avgRR) >= 1.5 ? "up" : "down"}
                loading={loading}
              />
              <StatCard
                title="Recovery Factor"
                // value={
                //   loading
                //     ? "—"
                //     : (() => {
                //         let peak = 0,
                //           equity = 0,
                //           maxDD = 0;
                //         filteredTrades.forEach((t) => {
                //           equity += getRoi(t);
                //           peak = Math.max(peak, equity);
                //           const dd =
                //             peak > 0 ? ((peak - equity) / peak) * 100 : 0;
                //           maxDD = Math.max(maxDD, dd);
                //         });
                //         const rf =
                //           maxDD > 0 ? (totalPnL / maxDD).toFixed(2) : "∞";
                //         return String(rf);
                //       })()
                // }
                value={loading ? "—" : stats.recoveryFactor}
                subtitle="Net P&L ÷ max drawdown"
                icon={Zap}
                trend={parseFloat(stats.recoveryFactor) >= 1 ? "up" : "down"}
                loading={loading}
              />
            </div>
          ) : (
            ""
          )}

          <Card className="w-full hidden md:block overflow-hidden border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Equity Curve
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cumulative P&L across {totalTrades} trades
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-2xl font-extrabold ${pnlPositive ? "text-primary" : "text-destructive"}`}
                >
                  {pnlPositive ? "+" : "-"}${Math.abs(totalPnL).toFixed(2)}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
                  Net P&L
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-0 pt-2">
              {loading ? (
                <Skeleton className="h-[100px] w-full" />
              ) : equityData.length === 0 ? (
                <div className="h-[100px] flex items-center justify-center text-muted-foreground text-sm">
                  No trade data yet. Log your first trade to see your equity
                  curve.
                </div>
              ) : (
                <div className="w-full" style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart
                      data={equityData}
                      margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="eqGrad1"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.55}
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.04}
                          />
                        </linearGradient>
                        <linearGradient
                          id="eqGrad2"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        horizontal={true}
                        vertical={false}
                        stroke="hsl(var(--border))"
                        strokeOpacity={0.2}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={6}
                        interval="preserveStartEnd"
                      />
                      <YAxis />
                      <Tooltip
                        content={<EquityTooltip />}
                        cursor={{
                          stroke: "hsl(var(--primary))",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill="oklch(45.3% 0.124 130.933)"
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={1.8}
                        fill="url(#eqGrad2)"
                        dot={false}
                        activeDot={{
                          r: 3,
                          fill: "hsl(var(--primary))",
                          strokeWidth: 0,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
          {/* <Card className="hidden md:block">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">
                  Win / Loss
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : totalTrades === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No data
                  </div>
                ) : (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={winLossData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={72}
                          paddingAngle={4}
                          startAngle={90}
                          endAngle={-270}
                          label={({ name, percent }) =>
                            `${name} ${Math.round((percent || 0) * 100)}%`
                          }
                          labelLine={false}
                        >
                          {winLossData.map((_, index) => (
                            <Cell key={index} fill={pieColors[index]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card> */}

          {/* <Card className="hidden md:block">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">
                  Setup Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : setupData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No data
                  </div>
                ) : (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={setupData} barSize={28}>
                        <CartesianGrid
                          strokeDasharray="4 4"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="setup"
                          tick={{ fontSize: 10 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="winRate"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card> */}
          <div className="grid-cols-4 border-t border-border/60 divide-x divide-border/60 hidden md:grid">
            {[
              {
                label: "Profit Factor",
                value: loading ? "—" : stats.profitFactor,
                color:
                  parseFloat(stats.profitFactor) >= 1.5
                    ? "text-primary"
                    : "text-amber-500",
              },
              {
                label: "Avg Winner",
                value: loading ? "—" : `+${stats.avgWin.toFixed(2)}%`,
                color: "text-primary",
              },
              {
                label: "Avg Loser",
                value: loading ? "—" : `-${stats.avgLoss.toFixed(2)}%`,
                color: "text-destructive",
              },
              {
                label: "Win Rate",
                value: loading ? "—" : `${stats.winRate.toFixed(1)}%`,
                color:
                  stats.winRate >= 50 ? "text-primary" : "text-destructive",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center py-4 gap-1"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
                <p className={`text-base font-extrabold ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* <Card
              className={
                parseFloat(averageROI) >= 0
                  ? "border-primary/20 bg-primary/5"
                  : "border-destructive/20 bg-destructive/5"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">
                  Avg ROI / Trade
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${
                        parseFloat(averageROI) >= 0
                          ? "border-primary/30 bg-primary/10"
                          : "border-destructive/30 bg-destructive/10"
                      }`}
                    >
                      {parseFloat(averageROI) >= 0 ? (
                        <TrendingUp className="h-8 w-8 text-primary" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-destructive" />
                      )}
                    </div>
                    <p
                      className={`text-4xl font-extrabold ${
                        parseFloat(averageROI) >= 0
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {averageROI}%
                    </p>
                    <p className="text-xs text-center text-muted-foreground max-w-[180px]">
                      {parseFloat(averageROI) >= 0
                        ? "Positive average — keep executing your edge."
                        : "Negative average — review your setups."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card> */}
          {/* </div> */}

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6">
              <div>
                <CardTitle className=" font-bold">Recent Trades</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
                  Your last {recentTrades.length} logged trades
                </p>
              </div>
              <Link href="/trades">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-sm h-8"
                >
                  <span className="hidden md:block">View All</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">
                        Date
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">
                        Asset
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">
                        Setup
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">
                        Type
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">
                        Entry
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">
                        Exit
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">
                        Emotion
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">
                        Result
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3 text-right pr-6">
                        ROI
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow key={idx} className="border-border/40">
                          {Array.from({ length: 9 }).map((__, ci) => (
                            <TableCell key={ci} className="py-3.5">
                              <Skeleton className="h-3.5 w-full rounded-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : recentTrades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                              <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              No trades yet
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Start journaling to see your history here
                            </p>
                            <Link href="/journal">
                              <Button
                                size="sm"
                                className="gap-2 mt-1 h-8 text-xs"
                              >
                                <BookOpen className="h-3.5 w-3.5" /> Log First
                                Trade
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTrades.map((trade, i) => {
                        const isWin = trade.result === "win";
                        const isLoss = trade.result === "loss";
                        const roiValue = getRoi(trade);
                        const roiText =
                          roiValue !== 0
                            ? `${roiValue > 0 ? "+" : ""}${roiValue.toFixed(2)}%`
                            : "—";

                        return (
                          <TableRow
                            key={trade.id}
                            className="border-border/40 hover:bg-muted/30 transition-colors group"
                          >
                            <TableCell className="pl-6 py-4">
                              <p className="text-xs text-muted-foreground font-medium">
                                {trade.created_at
                                  ? format(
                                      new Date(trade.created_at),
                                      "MMM d, yyyy",
                                    )
                                  : "—"}
                              </p>
                            </TableCell>

                            <TableCell className="py-4">
                              <span className="text-sm font-extrabold text-foreground tracking-wide">
                                {trade.asset || "—"}
                              </span>
                            </TableCell>

                            <TableCell className="py-4 max-w-[110px]">
                              <span className="text-xs text-muted-foreground truncate block">
                                {trade.setup || "—"}
                              </span>
                            </TableCell>

                            <TableCell className="py-4">
                              {trade.trade_type ? (
                                <div
                                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                    trade.trade_type === "long"
                                      ? "text-primary"
                                      : "text-destructive"
                                  }`}
                                >
                                  {trade.trade_type === "long" ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {trade.trade_type.charAt(0).toUpperCase() +
                                    trade.trade_type.slice(1)}
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>

                            <TableCell className="py-4">
                              <span className="text-xs font-mono text-muted-foreground">
                                {trade.entry ?? "—"}
                              </span>
                            </TableCell>

                            <TableCell className="py-4">
                              <span className="text-xs font-mono text-muted-foreground">
                                {trade.exit ?? "—"}
                              </span>
                            </TableCell>

                            <TableCell className="py-4">
                              <span className="text-xs text-muted-foreground capitalize">
                                {trade.emotion ?? "—"}
                              </span>
                            </TableCell>

                            <TableCell className="py-4">
                              <div
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                  isWin
                                    ? "bg-primary/15 text-primary"
                                    : isLoss
                                      ? "bg-destructive/15 text-destructive"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isWin
                                      ? "bg-primary"
                                      : isLoss
                                        ? "bg-destructive"
                                        : "bg-muted-foreground"
                                  }`}
                                />
                                {trade.result
                                  ? trade.result.toUpperCase()
                                  : "—"}
                              </div>
                            </TableCell>

                            <TableCell
                              className={`text-right pr-6 py-4 text-sm font-extrabold tabular-nums ${
                                roiValue > 0
                                  ? "text-primary"
                                  : roiValue < 0
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {roiText}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
