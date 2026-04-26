"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CalendarIcon,
  X,
  Upload,
  FilePlus,
  Plus,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

const calcTrade = (
  entry: number,
  exit: number,
  positionSize: number,
  tradeType: string,
  accountBalance: number,
  commission: number,
) => {
  if (!entry || !exit || !positionSize) return { pnl: 0, roi: 0, result: null };
  const rawPnL =
    tradeType === "short"
      ? (entry - exit) * positionSize
      : (exit - entry) * positionSize;
  const pnl = rawPnL - commission;
  const roi = accountBalance > 0 ? (pnl / accountBalance) * 100 : 0;
  const result = pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven";
  return { pnl, roi, result };
};

const CSV_MAP: Record<string, string> = {
  date: "date",
  symbol: "asset",
  ticker: "asset",
  pair: "asset",
  instrument: "asset",
  side: "tradeType",
  direction: "tradeType",
  type: "tradeType",
  "entry price": "entry",
  open: "entry",
  "open price": "entry",
  "exit price": "exit",
  close: "exit",
  "close price": "exit",
  size: "positionSize",
  volume: "positionSize",
  quantity: "positionSize",
  qty: "positionSize",
  lots: "positionSize",
  profit: "pnl",
  "p&l": "pnl",
  pnl: "pnl",
  setup: "setup",
  strategy: "setup",
  pattern: "setup",
  emotion: "emotion",
  mood: "emotion",
  notes: "notes",
  comment: "notes",
  remarks: "notes",
  timeframe: "timeframe",
  tf: "timeframe",
  "stop loss": "stopLoss",
  sl: "stopLoss",
  "take profit": "takeProfit",
  tp: "takeProfit",
  commission: "commission",
  fees: "commission",
};

const parseCSV = (text: string) => {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/"/g, "").toLowerCase());
  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        const mapped = CSV_MAP[h] || h;
        row[mapped] = values[i] || "";
      });
      return row;
    })
    .filter((r) => Object.values(r).some((v) => v));
};

const SETUP_OPTIONS = [
  { value: "ict_breaker", label: "ICT Breaker Block" },
  { value: "ict_ob", label: "ICT Order Block" },
  { value: "ict_fvg", label: "ICT Fair Value Gap" },
  { value: "smc_choch", label: "SMC CHoCH + Retest" },
  { value: "smc_bos", label: "SMC BOS Continuation" },
  { value: "liquidity_grab", label: "Liquidity Grab / Stop Hunt" },
  { value: "demand_zone", label: "Supply & Demand Zone" },
  { value: "sr_flip", label: "S/R Level Flip" },
  { value: "trendline_break", label: "Trendline Break & Retest" },
  { value: "bull_flag", label: "Bull Flag Continuation" },
  { value: "bear_flag", label: "Bear Flag Continuation" },
  { value: "ascending_triangle", label: "Ascending Triangle Breakout" },
  { value: "descending_triangle", label: "Descending Triangle Breakdown" },
  { value: "double_bottom", label: "Double Bottom Reversal" },
  { value: "double_top", label: "Double Top Reversal" },
  { value: "head_shoulders", label: "Head & Shoulders" },
  { value: "golden_cross", label: "Golden Cross (MA Cross)" },
  { value: "death_cross", label: "Death Cross (MA Cross)" },
  { value: "rsi_divergence", label: "RSI Divergence" },
  { value: "macd_crossover", label: "MACD Signal Crossover" },
  { value: "vwap_reclaim", label: "VWAP Reclaim / Rejection" },
  { value: "opening_range", label: "Opening Range Breakout" },
  { value: "news_catalyst", label: "News / Fundamental Catalyst" },
  { value: "scalp_momentum", label: "Momentum Scalp" },
  { value: "other", label: "Custom Setup..." },
];

const EMOTION_OPTIONS = [
  { value: "disciplined", label: "Disciplined & Focused" },
  { value: "confident", label: "Confident" },
  { value: "calm", label: "Calm & Patient" },
  { value: "neutral", label: "Neutral" },
  { value: "anxious", label: "Anxious / Nervous" },
  { value: "fearful", label: "Fearful" },
  { value: "fomo", label: "FOMO (Fear of Missing Out)" },
  { value: "greedy", label: "Greedy / Overconfident" },
  { value: "revenge", label: "Revenge Trading" },
  { value: "tired", label: "Tired / Distracted" },
  { value: "impulsive", label: "Impulsive" },
  { value: "frustrated", label: "Frustrated" },
];

const MARKET_CONDITIONS = [
  { value: "strong_trend_bull", label: "Strong Bullish Trend" },
  { value: "strong_trend_bear", label: "Strong Bearish Trend" },
  { value: "weak_trend_bull", label: "Weak Bullish Trend" },
  { value: "weak_trend_bear", label: "Weak Bearish Trend" },
  { value: "consolidation", label: "Consolidation / Range" },
  { value: "high_volatility", label: "High Volatility" },
  { value: "low_volatility", label: "Low Volatility" },
  { value: "news_driven", label: "News-Driven / Event" },
  { value: "pre_market", label: "Pre-Market Session" },
  { value: "low_volume", label: "Low Volume / Choppy" },
];

const TIMEFRAMES = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const SESSIONS = [
  { value: "london", label: "London Session" },
  { value: "new_york", label: "New York Session" },
  { value: "london_ny_overlap", label: "London / NY Overlap" },
  { value: "asian", label: "Asian Session" },
  { value: "pre_market", label: "Pre-Market" },
  { value: "after_hours", label: "After Hours" },
];

const blank = () => ({
  date: undefined as Date | undefined,
  asset: "",
  tradeType: "",
  entry: "",
  exit: "",
  positionSize: "",
  accountBalance: "",
  commission: "0",
  stopLoss: "",
  takeProfit: "",
  setup: "",
  customSetup: "",
  emotion: "",
  marketCondition: "",
  timeframe: "",
  session: "",
  confidence: "5",
  rating: "3",
  notes: "",
  screenshotUrl: "",
  confluenceTags: [] as string[],
  newTag: "",
});

export default function Journal() {
  const [form, setForm] = useState(blank());
  const [calOpen, setCalOpen] = useState(false);
  const [customSetupOpen, setCustomSetupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const entryN = parseFloat(form.entry);
  const exitN = parseFloat(form.exit);
  const sizeN = parseFloat(form.positionSize);
  const balN = parseFloat(form.accountBalance);
  const commN = parseFloat(form.commission) || 0;
  const { pnl, roi, result } = calcTrade(
    entryN,
    exitN,
    sizeN,
    form.tradeType,
    balN,
    commN,
  );
  const riskAmount =
    entryN && form.stopLoss
      ? Math.abs(entryN - parseFloat(form.stopLoss)) * sizeN
      : 0;
  const rrRatio =
    riskAmount > 0 && pnl !== 0
      ? (Math.abs(pnl) / riskAmount).toFixed(2)
      : null;

  const addTag = () => {
    const tag = form.newTag.trim();
    if (tag && !form.confluenceTags.includes(tag))
      set("confluenceTags", [...form.confluenceTags, tag]);
    set("newTag", "");
  };

  const handleSetup = (val: string) => {
    if (val === "other") {
      setCustomSetupOpen(true);
    } else {
      set("setup", val);
    }
  };

  const handleSubmit = async () => {
    if (!form.asset || !form.tradeType || !form.entry || !form.exit) {
      toast.error("Please fill in Asset, Type, Entry, and Exit at minimum.");
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("trades").insert({
      user_id: user.id,
      date: form.date ? format(form.date, "yyyy-MM-dd") : null,
      asset: form.asset.trim().toUpperCase(),
      trade_type: form.tradeType,
      entry: entryN || null,
      exit: exitN || null,
      position_size: sizeN || null,
      account_balance: balN || null,
      commission: commN || null,
      stop_loss: form.stopLoss ? parseFloat(form.stopLoss) : null,
      take_profit: form.takeProfit ? parseFloat(form.takeProfit) : null,
      setup: form.setup || null,
      confluence: form.confluenceTags.length ? form.confluenceTags : null,
      market_condition: form.marketCondition || null,
      timeframe: form.timeframe || null,
      session: form.session || null,
      confidence_level: parseInt(form.confidence) || null,
      post_trade_rating: parseInt(form.rating) || null,
      emotion: form.emotion || null,
      notes: form.notes.trim() || null,
      screenshot_url: form.screenshotUrl.trim() || null,
      roi: parseFloat(roi.toFixed(4)),
      pnl: parseFloat(pnl.toFixed(2)),
      result,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Trade logged successfully!");
      setForm(blank());
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setCsvPreview(rows);
      setSelectedRows(rows.map((_, i) => i));
      setCsvImportOpen(true);
      setCsvLoading(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCsvImport = async () => {
    setCsvLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setCsvLoading(false);
      return;
    }

    const rows = selectedRows.map((i) => csvPreview[i]);
    const trades = rows.map((row) => {
      const entryN = parseFloat(row.entry) || 0;
      const exitN = parseFloat(row.exit) || 0;
      const sizeN = parseFloat(row.positionSize) || 1;
      const commN = parseFloat(row.commission) || 0;
      const type =
        (row.tradeType || "long").toLowerCase().includes("sell") ||
        (row.tradeType || "").toLowerCase() === "short"
          ? "short"
          : "long";
      const { pnl, roi, result } = calcTrade(
        entryN,
        exitN,
        sizeN,
        type,
        0,
        commN,
      );
      return {
        user_id: user.id,
        date: row.date || null,
        asset: (row.asset || "").toUpperCase() || null,
        trade_type: type,
        entry: entryN || null,
        exit: exitN || null,
        position_size: sizeN || null,
        setup: row.setup || null,
        emotion: row.emotion || null,
        timeframe: row.timeframe || null,
        stop_loss: row.stopLoss ? parseFloat(row.stopLoss) : null,
        take_profit: row.takeProfit ? parseFloat(row.takeProfit) : null,
        commission: commN || null,
        notes: row.notes || null,
        roi: parseFloat(roi.toFixed(4)),
        pnl: parseFloat((row.pnl ? parseFloat(row.pnl) : pnl).toFixed(2)),
        result: row.result || result,
      };
    });

    const { error } = await supabase.from("trades").insert(trades);
    if (error) toast.error(error.message);
    else {
      toast.success(`${trades.length} trades imported!`);
      setCsvImportOpen(false);
      setCsvPreview([]);
    }
    setCsvLoading(false);
  };

  const showPreview = entryN && exitN && sizeN && form.tradeType;

  return (
    <section className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-5xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-foreground text-center md:text-left">
              Trade Journal
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 text-center md:text-left">
              Log every trade with precision. Build your edge over time.
            </p>
          </div>
          <div className="flex items-center gap-2 mx-auto md:mx-0">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
              disabled={csvLoading}
            >
              <Upload className="h-4 w-4" />
              {csvLoading ? "Reading..." : "Import CSV"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {showPreview && (
          <div
            className={`rounded-2xl border p-4 flex flex-wrap items-center gap-6 ${
              result === "win"
                ? "border-primary/30 bg-primary/5"
                : result === "loss"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {result === "win" ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : result === "loss" ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Info className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm font-bold text-foreground">
                Live Preview
              </span>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  P&L
                </p>
                <p
                  className={`text-lg font-extrabold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {pnl >= 0 ? "+" : ""}
                  {pnl.toFixed(2)}
                </p>
              </div>
              {balN > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    ROI
                  </p>
                  <p
                    className={`text-lg font-extrabold ${roi >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {roi >= 0 ? "+" : ""}
                    {roi.toFixed(2)}%
                  </p>
                </div>
              )}
              {rrRatio && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    R:R
                  </p>
                  <p className="text-lg font-extrabold text-foreground">
                    {rrRatio}R
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Result
                </p>
                <p
                  className={`text-lg font-extrabold uppercase ${
                    result === "win"
                      ? "text-primary"
                      : result === "loss"
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {result}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-auto hidden md:block">
              P&L = (Exit − Entry) × Size − Commission
            </p>
          </div>
        )}

        <Card className="border-border">
          <CardContent className="p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  1
                </span>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Trade Identity
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </label>
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal h-10"
                      >
                        {form.date ? (
                          format(form.date, "MMM d, yyyy")
                        ) : (
                          <span className="text-muted-foreground">
                            Pick a date
                          </span>
                        )}
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.date}
                        onSelect={(d) => {
                          set("date", d);
                          setCalOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Instrument / Asset
                  </label>
                  <Input
                    placeholder="e.g. BTCUSD, EURUSD, AAPL"
                    className="h-10 uppercase"
                    value={form.asset}
                    onChange={(e) => set("asset", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => set("tradeType", "long")}
                      className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-semibold transition-all ${
                        form.tradeType === "long"
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" /> Long
                    </button>
                    <button
                      onClick={() => set("tradeType", "short")}
                      className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-semibold transition-all ${
                        form.tradeType === "short"
                          ? "border-destructive bg-destructive/15 text-destructive"
                          : "border-border text-muted-foreground hover:border-destructive/50"
                      }`}
                    >
                      <TrendingDown className="h-4 w-4" /> Short
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Trading Session
                  </label>
                  <Select
                    value={form.session}
                    onValueChange={(v) => set("session", v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Timeframe
                  </label>
                  <Select
                    value={form.timeframe}
                    onValueChange={(v) => set("timeframe", v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEFRAMES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Market Condition
                  </label>
                  <Select
                    value={form.marketCondition}
                    onValueChange={(v) => set("marketCondition", v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Market structure" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKET_CONDITIONS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  2
                </span>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider text-center md:text-left">
                  Price & Position
                </h2>
                <span className="text-xs text-muted-foreground hidden md:block">
                  · P&L = (Exit − Entry) × Position Size − Commission
                </span>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Entry Price
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-10 font-mono"
                    value={form.entry}
                    onChange={(e) => set("entry", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Exit Price
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-10 font-mono"
                    value={form.exit}
                    onChange={(e) => set("exit", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Position Size{" "}
                    <span className="normal-case">(units/lots/contracts)</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="1.0"
                    className="h-10 font-mono"
                    value={form.positionSize}
                    onChange={(e) => set("positionSize", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Stop Loss
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-10 font-mono"
                    value={form.stopLoss}
                    onChange={(e) => set("stopLoss", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Take Profit
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-10 font-mono"
                    value={form.takeProfit}
                    onChange={(e) => set("takeProfit", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Commission / Fees
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-10 font-mono"
                    value={form.commission}
                    onChange={(e) => set("commission", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Account Balance{" "}
                    <span className="normal-case">(for ROI%)</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 10000"
                    className="h-10 font-mono"
                    value={form.accountBalance}
                    onChange={(e) => set("accountBalance", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 3 — Strategy */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  3
                </span>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Strategy & Psychology
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Setup / Pattern
                  </label>
                  <Select value={form.setup} onValueChange={handleSetup}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select setup pattern" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {SETUP_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Emotional State at Entry
                  </label>
                  <Select
                    value={form.emotion}
                    onValueChange={(v) => set("emotion", v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="How were you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMOTION_OPTIONS.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Confidence */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pre-Trade Confidence{" "}
                    <span className="text-primary font-bold">
                      {form.confidence}/10
                    </span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => set("confidence", String(n))}
                        className={`h-8 w-8 rounded-lg text-xs font-bold border transition-all ${
                          parseInt(form.confidence) === n
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Post-trade rating */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Post-Trade Execution Rating{" "}
                    <span className="text-primary font-bold">
                      {form.rating}/5
                    </span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => set("rating", String(n))}
                        className={`text-xl transition-all ${parseInt(form.rating) >= n ? "opacity-100" : "opacity-30"}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confluence Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Confluence Factors
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Above VWAP, EMA stack, Session high..."
                    value={form.newTag}
                    onChange={(e) => set("newTag", e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    className="h-10"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={addTag}
                    className="h-10 w-10 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {form.confluenceTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.confluenceTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1.5 pr-1.5 py-1"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            set(
                              "confluenceTags",
                              form.confluenceTags.filter((t) => t !== tag),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Section 4 — Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  4
                </span>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Notes & Media
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Trade Thesis & Post-Trade Notes
                  </label>
                  <Textarea
                    placeholder="Why did you take this trade? What was the thesis? What happened? What would you do differently?"
                    className="min-h-[100px] resize-none"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Chart Screenshot URL
                  </label>
                  <Input
                    placeholder="https://..."
                    className="h-10"
                    value={form.screenshotUrl}
                    onChange={(e) => set("screenshotUrl", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full h-12 font-bold text-base gap-2"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{" "}
                  Saving Trade...
                </span>
              ) : (
                <>
                  <FilePlus className="h-5 w-5" /> Log Trade
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Custom Setup Dialog */}
      <Dialog open={customSetupOpen} onOpenChange={setCustomSetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Custom Setup Name</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="e.g. Wyckoff Spring, Turtle Soup..."
            value={form.customSetup}
            onChange={(e) => set("customSetup", e.target.value)}
          />
          <DialogFooter>
            <Button
              onClick={() => {
                if (form.customSetup.trim())
                  set("setup", form.customSetup.trim());
                setCustomSetupOpen(false);
              }}
            >
              Save Setup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Trades from CSV</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {csvPreview.length} trades detected. Select which to import.
            </p>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRows(csvPreview.map((_, i) => i))}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRows([])}
            >
              Deselect All
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              {selectedRows.length} selected
            </span>
          </div>

          <div className="rounded-xl border border-border overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 text-left w-8"></th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Asset</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Entry</th>
                  <th className="px-3 py-2 text-left">Exit</th>
                  <th className="px-3 py-2 text-left">Size</th>
                  <th className="px-3 py-2 text-left">Setup</th>
                  <th className="px-3 py-2 text-left">P&L</th>
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((row, i) => {
                  const en = parseFloat(row.entry) || 0;
                  const ex = parseFloat(row.exit) || 0;
                  const sz = parseFloat(row.positionSize) || 1;
                  const type =
                    (row.tradeType || "long").toLowerCase().includes("sell") ||
                    row.tradeType?.toLowerCase() === "short"
                      ? "short"
                      : "long";
                  const { pnl } = calcTrade(en, ex, sz, type, 0, 0);
                  const displayPnl = row.pnl ? parseFloat(row.pnl) : pnl;
                  const checked = selectedRows.includes(i);
                  return (
                    <tr
                      key={i}
                      className={`border-b border-border/50 ${checked ? "" : "opacity-40"}`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setSelectedRows(
                              e.target.checked
                                ? [...selectedRows, i]
                                : selectedRows.filter((r) => r !== i),
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-2">{row.date || "—"}</td>
                      <td className="px-3 py-2 font-semibold">
                        {(row.asset || "—").toUpperCase()}
                      </td>
                      <td
                        className={`px-3 py-2 font-semibold ${type === "long" ? "text-primary" : "text-destructive"}`}
                      >
                        {type}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {row.entry || "—"}
                      </td>
                      <td className="px-3 py-2 font-mono">{row.exit || "—"}</td>
                      <td className="px-3 py-2">{row.positionSize || "1"}</td>
                      <td className="px-3 py-2">{row.setup || "—"}</td>
                      <td
                        className={`px-3 py-2 font-bold ${displayPnl >= 0 ? "text-primary" : "text-destructive"}`}
                      >
                        {displayPnl >= 0 ? "+" : ""}
                        {displayPnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCsvImportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCsvImport}
              disabled={csvLoading || selectedRows.length === 0}
              className="gap-2"
            >
              {csvLoading ? (
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import {selectedRows.length} Trade
              {selectedRows.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
