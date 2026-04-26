"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import Link from "next/link";

type SortKey = "date" | "asset" | "roi" | "result" | "trade_type";
type SortDir = "asc" | "desc";

export default function Trades() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

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
      if (!error) setTrades(data || []);
      setLoading(false);
    };
    fetchTrades();
  }, []);

  const getRoi = (t: any) => {
    const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return isNaN(r) ? 0 : r;
  };

  // Summary stats
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const totalRoi = trades.reduce((a, t) => a + getRoi(t), 0);
  const winRate = trades.length
    ? ((wins / trades.length) * 100).toFixed(1)
    : "0.0";

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...trades];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.asset || "").toLowerCase().includes(q) ||
          (t.setup || "").toLowerCase().includes(q) ||
          (t.emotion || "").toLowerCase().includes(q),
      );
    }
    if (filterResult !== "all")
      result = result.filter((t) => t.result === filterResult);
    if (filterType !== "all")
      result = result.filter((t) => t.trade_type === filterType);

    result.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortKey === "date") {
        aVal = new Date(a.date || 0);
        bVal = new Date(b.date || 0);
      } else if (sortKey === "roi") {
        aVal = getRoi(a);
        bVal = getRoi(b);
      } else {
        aVal = (a[sortKey] || "").toString().toLowerCase();
        bVal = (b[sortKey] || "").toString().toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [trades, search, filterResult, filterType, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterResult("all");
    setFilterType("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search || filterResult !== "all" || filterType !== "all";

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <section className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-foreground">Trade Journal</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {trades.length} trades logged · {winRate}% win rate
            </p>
          </div>
          <Link href="/journal">
            <Button size="sm" className="gap-2 font-semibold">
              <BookOpen className="h-4 w-4" />
              Log New Trade
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Trades",
              value: loading ? null : trades.length,
              sub: "all time",
              color: "text-foreground",
            },
            {
              label: "Win Rate",
              value: loading ? null : `${winRate}%`,
              sub: `${wins}W / ${losses}L`,
              color:
                parseFloat(winRate) >= 50 ? "text-primary" : "text-destructive",
            },
            {
              label: "Total ROI",
              value: loading
                ? null
                : `${totalRoi >= 0 ? "+" : ""}${totalRoi.toFixed(2)}%`,
              sub: "cumulative",
              color: totalRoi >= 0 ? "text-primary" : "text-destructive",
            },
            {
              label: "Avg ROI",
              value: loading
                ? null
                : `${trades.length ? (totalRoi / trades.length).toFixed(2) : "0.00"}%`,
              sub: "per trade",
              color:
                totalRoi / (trades.length || 1) >= 0
                  ? "text-primary"
                  : "text-destructive",
            },
          ].map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  {s.label}
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-20 mb-1" />
                ) : (
                  <p className={`text-2xl font-extrabold ${s.color}`}>
                    {s.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by asset, setup, emotion..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  !
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 gap-1 text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border bg-muted/30">
              <Select
                value={filterResult}
                onValueChange={(v) => {
                  setFilterResult(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-36 text-sm">
                  <SelectValue placeholder="Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="win">Wins</SelectItem>
                  <SelectItem value="loss">Losses</SelectItem>
                  <SelectItem value="breakeven">Breakeven</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterType}
                onValueChange={(v) => {
                  setFilterType(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-36 text-sm">
                  <SelectValue placeholder="Trade Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>

              <p className="flex items-center text-xs text-muted-foreground ml-1">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <Card className="border-dashed border-border">
            <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">
                  No trades yet
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Start logging your trades to build your journal and see
                  patterns emerge.
                </p>
              </div>
              <Link href="/journal">
                <Button size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" /> Log First Trade
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-border">
            <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="font-semibold text-foreground">
                No trades match your filters
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                    {[
                      { label: "Date", key: "date" as SortKey },
                      { label: "Asset", key: "asset" as SortKey },
                      { label: "Type", key: "trade_type" as SortKey },
                      { label: "Setup", key: null },
                      { label: "Emotion", key: null },
                      { label: "Entry", key: null },
                      { label: "Exit", key: null },
                      { label: "Result", key: "result" as SortKey },
                      { label: "ROI", key: "roi" as SortKey },
                    ].map((col) => (
                      <TableHead
                        key={col.label}
                        className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 ${col.key ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                        onClick={() => col.key && handleSort(col.key)}
                      >
                        <span className="flex items-center gap-1.5">
                          {col.label}
                          {col.key && <SortIcon col={col.key} />}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((trade, idx) => {
                    const roi = getRoi(trade);
                    const isWin = trade.result === "win";
                    const isLoss = trade.result === "loss";
                    return (
                      <TableRow
                        key={trade.id || idx}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                      >
                        <TableCell className="py-3.5 text-sm text-muted-foreground font-medium">
                          {trade.date
                            ? format(new Date(trade.date), "MMM d, yyyy")
                            : "—"}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span className="font-bold text-sm text-foreground">
                            {trade.asset || "—"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5">
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

                        <TableCell className="py-3.5 text-sm text-muted-foreground max-w-[120px] truncate">
                          {trade.setup || "—"}
                        </TableCell>

                        <TableCell className="py-3.5 text-sm text-muted-foreground">
                          {trade.emotion || "—"}
                        </TableCell>

                        <TableCell className="py-3.5 text-sm text-muted-foreground font-mono">
                          {trade.entry ?? "—"}
                        </TableCell>

                        <TableCell className="py-3.5 text-sm text-muted-foreground font-mono">
                          {trade.exit ?? "—"}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <Badge
                            variant={
                              isWin
                                ? "default"
                                : isLoss
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs font-bold uppercase tracking-wide"
                          >
                            {trade.result || "—"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span
                            className={`text-sm font-extrabold ${
                              roi > 0
                                ? "text-primary"
                                : roi < 0
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {roi !== 0
                              ? `${roi > 0 ? "+" : ""}${roi.toFixed(2)}%`
                              : "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {filtered.length}
                </span>{" "}
                trades
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                  let page: number;
                  if (pageCount <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= pageCount - 2)
                    page = pageCount - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs font-semibold"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === pageCount}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pageCount, p + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
