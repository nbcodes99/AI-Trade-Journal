"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
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
  Clock,
  DollarSign,
} from "lucide-react";
import Footer from "../components/Footer";

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

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setLoading(false);
        return;
      }

      const nameFromMeta =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.given_name ||
        null;
      setUserName(nameFromMeta);

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      setTrades(error ? [] : data || []);
      setLoading(false);
    };
    fetchTrades();
  }, []);

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

  const filteredTrades = getFilteredTrades();
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter((t) => t.result === "win").length;
  const losses = filteredTrades.filter((t) => t.result === "loss").length;
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : "0.0";

  const getRoi = (t: any) => {
    const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return isNaN(r) ? 0 : r;
  };

  const totalPnL = filteredTrades.reduce((acc, t) => acc + getRoi(t), 0);
  const averageROI = totalTrades ? (totalPnL / totalTrades).toFixed(2) : "0.00";
  const allRois = filteredTrades.map(getRoi);
  const bestTrade = allRois.length ? Math.max(...allRois) : 0;
  const worstTrade = allRois.length ? Math.min(...allRois) : 0;
  const profitFactor =
    losses > 0 ? (wins / losses).toFixed(2) : wins > 0 ? "∞" : "0";

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

  const equityData = filteredTrades.map((t, i) => ({
    trade: i + 1,
    value: parseFloat(
      filteredTrades
        .slice(0, i + 1)
        .reduce((acc, x) => acc + getRoi(x), 0)
        .toFixed(2),
    ),
    label: t.asset || `#${i + 1}`,
    date: t.created_at,
  }));

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

  const recentTrades = trades.slice(-5).reverse();
  const pnlPositive = totalPnL >= 0;
  const winRateNum = parseFloat(winRate);

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

        <div className="p-6 space-y-6">
          <div className="grid lg:grid-cols-4 gap-4 grid-cols-1">
            <StatCard
              title="Total P&L"
              value={
                pnlPositive
                  ? `+$${totalPnL.toFixed(2)}`
                  : `-$${Math.abs(totalPnL).toFixed(2)}`
              }
              subtitle="Cumulative return"
              icon={DollarSign}
              trend={pnlPositive ? "up" : "down"}
              loading={loading}
            />
            <StatCard
              title="Win Rate"
              value={`${winRate}%`}
              subtitle={`${wins}W / ${losses}L`}
              icon={Target}
              trend={winRateNum >= 50 ? "up" : "down"}
              loading={loading}
            />
            <StatCard
              title="Total Trades"
              value={totalTrades}
              subtitle={`in selected period`}
              icon={Activity}
              trend="neutral"
              loading={loading}
            />
            <StatCard
              title="Profit Factor"
              value={profitFactor}
              subtitle="Wins to losses ratio"
              icon={BarChart2}
              trend={parseFloat(profitFactor as string) >= 1 ? "up" : "down"}
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <StatCard
              title="Avg ROI / Trade"
              value={`${averageROI}%`}
              subtitle="Per trade average"
              icon={TrendingUp}
              trend={parseFloat(averageROI) >= 0 ? "up" : "down"}
              loading={loading}
            />
            <StatCard
              title="Best Trade"
              value={`+${bestTrade.toFixed(2)}%`}
              subtitle="Highest single return"
              icon={Award}
              trend="up"
              loading={loading}
            />
            <StatCard
              title="Worst Trade"
              value={`${worstTrade.toFixed(2)}%`}
              subtitle="Largest single loss"
              icon={AlertTriangle}
              trend="down"
              loading={loading}
            />
            <StatCard
              title="Best Streak"
              value={`${bestStreak}W`}
              subtitle={`Current: ${currentStreak}W`}
              icon={Zap}
              trend="neutral"
              loading={loading}
            />
          </div>

          <Card className="w-full hidden md:block">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <div>
                <CardTitle className="text-base font-bold">
                  Equity Curve
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cumulative P&L across {totalTrades} trades
                </p>
              </div>
              <Badge
                variant={pnlPositive ? "default" : "destructive"}
                className="text-xs"
              >
                {pnlPositive
                  ? `+$${totalPnL.toFixed(2)}`
                  : `-$${Math.abs(totalPnL).toFixed(2)}`}
              </Badge>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-4">
              {loading ? (
                <Skeleton className="h-[120px] w-full" />
              ) : equityData.length === 0 ? (
                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
                  No trade data yet. Log your first trade to see your equity
                  curve.
                </div>
              ) : (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart
                      data={equityData}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="equityGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                        <linearGradient
                          id="equityGradient2"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.08}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        horizontal={true}
                        vertical={false}
                        stroke="hsl(var(--border))"
                        strokeOpacity={0.3}
                        strokeDasharray="0"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        interval="preserveStartEnd"
                      />
                      <YAxis hide />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        cursor={{
                          stroke: "hsl(var(--primary))",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
                      />
                      <Area
                        type="monotoneX"
                        dataKey="value"
                        stroke="transparent"
                        strokeWidth={0}
                        fill="url(#equityGradient2)"
                        dot={false}
                        activeDot={false}
                      />
                      <Area
                        type="monotoneX"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={1.5}
                        fill="url(#equityGradient)"
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: "hsl(var(--primary))",
                          strokeWidth: 0,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hidden md:block">
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
            </Card>

            <Card className="hidden md:block">
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
            </Card>

            <Card
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
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">
                Recent Trades
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {recentTrades.length} trades
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="pl-6 text-xs font-semibold">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Asset
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Setup
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Entry
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Exit
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Type
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Emotion
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Result
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-right pr-6">
                        ROI
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow key={idx}>
                          {Array.from({ length: 9 }).map((__, ci) => (
                            <TableCell key={ci}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : recentTrades.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-12 text-muted-foreground text-sm"
                        >
                          No trades logged yet. Start journaling to see your
                          history here.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTrades.map((trade) => {
                        const isWin = trade.result === "win";
                        const roiValue = getRoi(trade);
                        const roiText =
                          roiValue !== 0
                            ? `${roiValue > 0 ? "+" : ""}${roiValue.toFixed(2)}%`
                            : "—";
                        return (
                          <TableRow
                            key={trade.id}
                            className="hover:bg-muted/40 transition-colors"
                          >
                            <TableCell className="pl-6 text-xs text-muted-foreground">
                              {trade.created_at
                                ? format(
                                    new Date(trade.created_at),
                                    "MMM dd, yyyy",
                                  )
                                : "—"}
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              {trade.asset || "—"}
                            </TableCell>
                            <TableCell className="text-xs max-w-[100px] truncate">
                              {trade.setup || "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {trade.entry ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {trade.exit ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {trade.trade_type ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {trade.emotion ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  isWin
                                    ? "default"
                                    : trade.result === "loss"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-xs font-bold"
                              >
                                {trade.result
                                  ? trade.result.toUpperCase()
                                  : "—"}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`text-right pr-6 text-sm font-bold ${
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
      {/* <Footer /> */}
    </>
  );
}
