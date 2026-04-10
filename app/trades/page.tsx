"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CiLocationArrow1 } from "react-icons/ci";

export default function Trades() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const pageCount = Math.max(1, Math.ceil(trades.length / pageSize));
  const paginatedTrades = trades.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (!error) {
        setTrades(data || []);
      }

      setLoading(false);
    };

    fetchTrades();
  }, []);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  return (
    <section className="flex flex-col items-center w-full max-w-6xl mx-auto px-2 mt-6">
      <div className="w-full flex flex-col gap-3 mb-6">
        <div className="flex flex-col gap-2 items-center md:items-start md:flex-row md:justify-between text-center md:text-left">
          <div>
            <h1 className="text-3xl font-bold">Trades Review</h1>
            <p className="max-w-3xl text-sm text-muted-foreground mt-2">
              This page shows every trade you journaled. Use the Journal page to
              add new entries, then come back here to review your full trade
              history.
            </p>
          </div>
          <Button
            className="flex items-center gap-2 cursor-pointer"
            variant="ghost"
          >
            <CiLocationArrow1 />
            <a href="/journal">Journal</a>
          </Button>
        </div>
      </div>
      <div className="w-full">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted p-6 text-muted-foreground">
            <p className="mb-2 text-foreground font-medium">
              No trades found yet.
            </p>
            <p>
              Head to the{" "}
              <a href="/journal" className="text-primary underline">
                Journal
              </a>{" "}
              page to log your first trade.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full rounded-3xl border border-border bg-background/80 p-2 shadow-sm">
              <Table className="w-full font-medium">
                <TableHeader>
                  <TableRow className="bg-muted/30 text-sm text-muted-foreground">
                    <TableHead className="py-4">Date</TableHead>
                    <TableHead className="py-4">Asset</TableHead>
                    <TableHead className="py-4">Type</TableHead>
                    <TableHead className="py-4">Result</TableHead>
                    <TableHead className="py-4">ROI</TableHead>
                    <TableHead className="py-4">Setup</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTrades.map((trade) => (
                    <TableRow
                      key={
                        trade.id ||
                        `${trade.date}-${trade.asset}-${trade.entry}`
                      }
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="py-4">
                        {trade.date
                          ? format(new Date(trade.date), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="py-4 font-medium">
                        {trade.asset || "Unknown"}
                      </TableCell>
                      <TableCell
                        className={`py-4 ${trade.trade_type === "short" ? "text-red-500" : "text-lime-400"}`}
                      >
                        {trade.trade_type || "—"}
                      </TableCell>
                      <TableCell className="py-4">
                        {trade.result || "—"}
                      </TableCell>
                      <TableCell
                        className={`py-4 ${typeof trade.roi === "number" && trade.roi > 0 ? "text-lime-400" : typeof trade.roi === "number" && trade.roi < 0 ? "text-red-500" : ""}`}
                      >
                        {typeof trade.roi === "number"
                          ? `${trade.roi.toFixed(2)}%`
                          : (trade.roi ?? "—")}
                      </TableCell>
                      <TableCell className="py-4">
                        {trade.setup || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex flex-col gap-3 items-center sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedTrades.length} of {trades.length} trades
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pageCount}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(pageCount, page + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
