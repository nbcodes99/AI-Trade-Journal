"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ViewTradesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setupParam = searchParams.get("setup") || "";
  const { session, isLoading } = useAuth();
  const userId = session?.user?.id ?? null;

  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .ilike("setup", `%${setupParam}%`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading trades:", error);
        setTrades([]);
      } else {
        setTrades(data || []);
      }
      setLoading(false);
    };
    load();
  }, [setupParam, userId]);

  if (!session)
    return (
      <p className="text-muted-foreground">
        Please log in ,
        <Link href="/login" className="text-indigo-500 underline">
          here
        </Link>
      </p>
    );

  return (
    <section className="p-8">
      <div className="flex items-center justify-between mb-10 mx-4">
        <h1 className="text-xl md:text-2xl font-bold">View Trades</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="uppercase text-center">{setupParam}</CardTitle>
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
                <TableHead>Result</TableHead>
                <TableHead>ROI (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    {trade.created_at
                      ? format(new Date(trade.created_at), "yyyy-MM-dd")
                      : ""}
                  </TableCell>
                  <TableCell>{trade.asset}</TableCell>
                  <TableCell>{trade.setup}</TableCell>
                  <TableCell>{trade.entry}</TableCell>
                  <TableCell>{trade.exit}</TableCell>
                  <TableCell>{trade.result}</TableCell>
                  <TableCell>
                    {trade.roi !== null && trade.roi !== undefined
                      ? `${(typeof trade.roi === "number" ? trade.roi : parseFloat(trade.roi)).toFixed(2)}%`
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
