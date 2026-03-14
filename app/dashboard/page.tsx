"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
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
} from "recharts";
import { format } from "date-fns";
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

  useEffect(() => {
    const fetchTrades = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
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
        .order("date", { ascending: true });

      if (error) {
        console.error(error.message);
      } else {
        setTrades(data || []);
      }
      setLoading(false);
    };

    fetchTrades();
  }, []);

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;

  const totalPnL = trades.reduce((acc, t) => acc + (t.roi || 0), 0);

  const equityData = trades.map((t, i) => ({
    trade: i + 1,
    value: trades.slice(0, i + 1).reduce((acc, x) => acc + (x.roi || 0), 0),
  }));

  const winLossData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];

  const setupData = Object.values(
    trades.reduce((acc: any, t) => {
      if (!acc[t.setup])
        acc[t.setup] = { setup: t.setup, winRate: 0, count: 0, wins: 0 };
      acc[t.setup].count++;
      if (t.result === "win") acc[t.setup].wins++;
      return acc;
    }, {}),
  ).map((s: any) => ({
    setup: s.setup,
    winRate: s.count ? Math.round((s.wins / s.count) * 100) : 0,
  }));

  const snapshot = [
    { title: "Total Trades", value: totalTrades },
    { title: "Win Rate", value: `${winRate}%` },
    { title: "Total P&L", value: `$${totalPnL.toFixed(2)}` },
  ];

  const recentTrades = trades.slice(-5).reverse();

  return (
    <section className="">
      <h1 className="text-3xl text-center font-bold my-6">
        Hey, <span>{userName ? `${userName}` : ""}</span>
        👋🏼
      </h1>
      <div className="min-h-screen text-white p-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {snapshot.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
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
                    <Line type="monotone" dataKey="value" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

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
                      outerRadius={80}
                      label
                    />
                    <Tooltip content={<ChartTooltipContent />} />
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
                    <Bar dataKey="winRate" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
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
                  <TableHead>ROI (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrades.map((trade, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {trade.date ? format(new Date(trade.date), "MMM dd") : ""}
                    </TableCell>
                    <TableCell>{trade.asset}</TableCell>
                    <TableCell>{trade.setup}</TableCell>
                    <TableCell>{trade.entry}</TableCell>
                    <TableCell>{trade.exit}</TableCell>
                    <TableCell>{trade.trade_type}</TableCell>
                    <TableCell>{trade.emotion}</TableCell>
                    <TableCell>{trade.confluence}</TableCell>
                    <TableCell>{trade.result}</TableCell>
                    <TableCell>
                      {trade.roi !== null && trade.roi !== undefined
                        ? `${trade.roi.toFixed(2)}%`
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
