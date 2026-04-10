"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
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

const chartConfig = {
  value: { label: "Value" },
  winRate: { label: "Win Rate" },
};

export default function Dashboard() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("1W");

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setLoading(false);
        return;
      }

      if (!user) {
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

      if (error) {
        setTrades([]);
      } else {
        setTrades(data || []);
      }
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
    return trades.filter((t) => {
      const tradeDate = new Date(t.created_at || t.date);
      return tradeDate >= startDate;
    });
  };

  const filteredTrades = getFilteredTrades();

  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter((t) => t.result === "win").length;
  const losses = filteredTrades.filter((t) => t.result === "loss").length;
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : "0.0";

  const totalPnL = filteredTrades.reduce((acc, t) => {
    const roi = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return acc + (isNaN(roi) ? 0 : roi);
  }, 0);

  const averageROI = totalTrades ? (totalPnL / totalTrades).toFixed(2) : "0.00";
  const averageRoiNumber = parseFloat(averageROI);
  const averageRoiTextColor =
    averageRoiNumber >= 0 ? "text-primary" : "text-red-600 dark:text-red-300";
  const averageRoiBg =
    averageRoiNumber >= 0
      ? "bg-emerald-100 dark:bg-emerald-900/20"
      : "bg-red-100 dark:bg-red-900/20";

  const equityData = filteredTrades.map((t, i) => {
    const value = filteredTrades.slice(0, i + 1).reduce((acc, x) => {
      const r = typeof x.roi === "string" ? parseFloat(x.roi) : x.roi;
      return acc + (isNaN(r) ? 0 : r);
    }, 0);
    return {
      trade: i + 1,
      value,
      label: t.asset || `#${i + 1}`,
      date: t.created_at,
    };
  });

  const winLossData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];

  const setupData = Object.values(
    filteredTrades.reduce((acc: any, t) => {
      const key = t.setup || "Unknown";
      if (!acc[key]) acc[key] = { setup: key, winRate: 0, count: 0, wins: 0 };
      acc[key].count++;
      if (t.result === "win") acc[key].wins++;
      return acc;
    }, {}),
  ).map((s: any) => ({
    setup: s.setup,
    winRate: s.count ? Math.round((s.wins / s.count) * 100) : 0,
    count: s.count,
  }));

  const snapshot = [
    { title: "Total Trades", value: totalTrades },
    { title: "Win Rate", value: `${winRate}%` },
    {
      title: "Total P&L",
      value:
        totalPnL >= 0
          ? `+$${totalPnL.toFixed(2)}`
          : `-$${Math.abs(totalPnL).toFixed(2)}`,
    },
    {
      title: "Best Trade",
      value:
        filteredTrades.length > 0
          ? `+${Math.max(...filteredTrades.map((t) => (typeof t.roi === "string" ? parseFloat(t.roi) : t.roi || 0))).toFixed(2)}%`
          : "—",
    },
  ];

  const recentTrades = trades.slice(-5).reverse();
  const pieColors = ["#16a34a", "#ef4444"];

  return (
    <section className="">
      <h1 className="text-3xl text-center font-bold my-6">
        Hey,{" "}
        <span className="text-primary">
          {loading ? (
            <Skeleton className="inline-block h-8 w-28" />
          ) : userName ? (
            `${userName}`
          ) : (
            ""
          )}
        </span>{" "}
        👋🏼
      </h1>

      <div className="min-h-screen text-white p-8 space-y-12">
        <div className="flex justify-center mb-6">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted/50 p-1 text-muted-foreground border border-border/50">
            {["All", "1W", "2W", "1M", "1Y"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  timeframe === tf
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-muted/80"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? ["a", "b", "c", "d"].map((key) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>
                      <Skeleton className="h-4 w-24" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-28" />
                  </CardContent>
                </Card>
              ))
            : snapshot.map((item) => {
                let bgClass = "bg-card text-card-foreground";
                if (item.title === "Win Rate") {
                  const rate = parseFloat(
                    (item.value as string).replace("%", ""),
                  );
                  if (rate > 70) {
                    bgClass =
                      "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                  } else if (rate >= 40) {
                    bgClass =
                      "bg-gray-100 dark:bg-gray-800/20 text-gray-800 dark:text-gray-200";
                  } else {
                    bgClass =
                      "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
                  }
                } else if (item.title === "Total Trades") {
                  bgClass =
                    "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
                } else if (item.title === "Total P&L") {
                  if ((item.value as string).startsWith("+")) {
                    bgClass =
                      "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                  } else if ((item.value as string).startsWith("-")) {
                    bgClass =
                      "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
                  } else {
                    bgClass =
                      "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
                  }
                } else if (item.title === "Best Trade") {
                  bgClass =
                    "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200";
                }
                return (
                  <Card key={item.title} className={bgClass}>
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-4 w-28" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Equity Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={equityData}>
                      <CartesianGrid strokeDasharray="4 4" />
                      <XAxis dataKey="trade" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="value" stroke="#4ade80" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            ["winloss", "setup", "average"].map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-4 w-28" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Win/Loss Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={winLossData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={72}
                          paddingAngle={6}
                          startAngle={90}
                          endAngle={-270}
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${Math.round((percent || 0) * 100)}%`
                          }
                        >
                          {winLossData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={pieColors[index % pieColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance by Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={setupData}>
                        <CartesianGrid strokeDasharray="4 4" />
                        <XAxis dataKey="setup" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="winRate" fill="#4d7c0f" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className={averageRoiBg}>
                <CardHeader>
                  <CardTitle>Average ROI per Trade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <p
                        className={`text-4xl font-bold ${averageRoiTextColor}`}
                      >
                        {averageROI}%
                      </p>
                      <p
                        className={`text-sm mt-2 ${
                          averageRoiNumber >= 0
                            ? "text-primary"
                            : "text-red-600 dark:text-red-300"
                        }`}
                      >
                        {averageRoiNumber >= 0
                          ? "Nice work! Your recent trades are trending positive."
                          : "Warning!!! You are currently in a negative ROI zone."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card className="w-full max-w-full">
          <CardHeader>
            <CardTitle className="text-center">Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Trade Type</TableHead>
                  <TableHead>Emotion</TableHead>
                  <TableHead>Confluence</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">ROI (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={`skeleton-${idx}`}>
                        {Array.from({ length: 10 }).map((__, ci) => (
                          <TableCell key={ci} className="py-3">
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : recentTrades.map((trade) => {
                      const isWin = trade.result === "win";
                      const roiValue =
                        trade.roi !== null && trade.roi !== undefined
                          ? typeof trade.roi === "number"
                            ? trade.roi
                            : parseFloat(trade.roi)
                          : null;
                      const roiText =
                        roiValue !== null && !isNaN(roiValue)
                          ? `${roiValue.toFixed(2)}%`
                          : "";
                      const resultColor = isWin
                        ? "text-green-600 dark:text-green-300"
                        : trade.result === "loss"
                          ? "text-red-600 dark:text-red-300"
                          : "text-muted-foreground";
                      const roiColor =
                        roiValue === null
                          ? "text-muted-foreground"
                          : roiValue > 0
                            ? "text-green-600 dark:text-green-300"
                            : roiValue < 0
                              ? "text-red-600 dark:text-red-300"
                              : "text-muted-foreground";

                      return (
                        <TableRow
                          key={trade.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="py-3">
                            {trade.created_at
                              ? format(
                                  new Date(trade.created_at),
                                  "MMM dd, yyyy",
                                )
                              : ""}
                          </TableCell>

                          <TableCell className="font-medium">
                            {trade.asset || "—"}
                          </TableCell>

                          <TableCell
                            className="max-w-xs truncate"
                            title={trade.setup || ""}
                          >
                            {trade.setup || "—"}
                          </TableCell>

                          <TableCell>{trade.entry ?? "—"}</TableCell>

                          <TableCell>{trade.exit ?? "—"}</TableCell>

                          <TableCell>{trade.trade_type ?? "—"}</TableCell>

                          <TableCell>{trade.emotion ?? "—"}</TableCell>

                          <TableCell
                            className="max-w-sm truncate"
                            title={
                              Array.isArray(trade.confluence)
                                ? trade.confluence.join(", ")
                                : trade.confluence
                            }
                          >
                            {Array.isArray(trade.confluence)
                              ? trade.confluence.join(", ")
                              : (trade.confluence ?? "—")}
                          </TableCell>

                          <TableCell className={`font-semibold ${resultColor}`}>
                            {trade.result ? trade.result.toUpperCase() : "—"}
                          </TableCell>

                          <TableCell
                            className={`text-right font-medium ${roiColor}`}
                          >
                            {roiText}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
