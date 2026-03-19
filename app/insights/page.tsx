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
import OpenAI from "openai";

const chartConfig = {
  value: { label: "Value" },
  winRate: { label: "Win Rate" },
};

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      });

      setAiInsights(
        response.choices[0].message.content || "No insights generated.",
      );
    } catch (error) {
      console.error("AI Insights error:", error);
      setAiInsights("Unable to generate insights at this time.");
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
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {aiInsights}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
