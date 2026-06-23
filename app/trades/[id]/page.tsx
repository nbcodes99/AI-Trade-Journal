"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  Target,
  Zap,
  Brain,
  BarChart2,
  DollarSign,
  Hash,
  Clock,
  Activity,
  StickyNote,
  ImageIcon,
} from "lucide-react";
import {
  getTradeRoi,
  getTradePnl,
  getTradeDate,
  type Trade,
} from "@/lib/tradeCalculations";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number | null | undefined;
  color?: string;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-lg font-extrabold font-mono leading-none ${color || "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: any;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2.5 shrink-0">
        {Icon && (
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted shrink-0">
            <Icon className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground text-right ml-4 max-w-[55%] break-words">
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60 bg-muted/30">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      <div className="px-5">{children}</div>
    </motion.div>
  );
}

export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        toast.error("Trade not found.");
        router.push("/trades");
        return;
      }
      setTrade(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!trade) return;
    setDeleting(true);
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete trade.");
      setDeleting(false);
      return;
    }
    toast.success("Trade deleted.");
    router.push("/trades");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <Skeleton className="h-52 w-full rounded-3xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!trade) return null;

  const roi = getTradeRoi(trade);
  const pnl = getTradePnl(trade);
  const isWin = trade.result === "win";
  const isLoss = trade.result === "loss";
  const tradeDate = getTradeDate(trade);

  const confluenceTags: string[] = (() => {
    try {
      if (Array.isArray(trade.confluence_tags)) return trade.confluence_tags;
      if (typeof trade.confluence_tags === "string")
        return JSON.parse(trade.confluence_tags);
      return [];
    } catch {
      return [];
    }
  })();

  const rrRatio = (() => {
    const entry = parseFloat(String(trade.entry || 0));
    const sl = parseFloat(String(trade.stop_loss || 0));
    const tp = parseFloat(String(trade.take_profit || 0));
    if (!entry || !sl || !tp) return null;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    if (!risk) return null;
    return (reward / risk).toFixed(2);
  })();

  return (
    <section className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:block">Delete Trade</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes this trade from your journal. This
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      "Yes, delete it"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div
            className={`absolute inset-0 pointer-events-none ${
              isWin
                ? "bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,hsl(var(--primary)/0.1),transparent)]"
                : isLoss
                  ? "bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,hsl(var(--destructive)/0.08),transparent)]"
                  : "bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,hsl(var(--muted)/0.5),transparent)]"
            }`}
          />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="space-y-3">
                <h1 className="text-3xl text-center md:text-4xl font-bold text-foreground tracking-tight leading-none">
                  {trade.asset || "—"}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {trade.trade_type && (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                        trade.trade_type === "long"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {trade.trade_type === "long" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {trade.trade_type.toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                      isWin
                        ? "border-primary/30 bg-primary/15 text-primary"
                        : isLoss
                          ? "border-destructive/30 bg-destructive/15 text-destructive"
                          : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isWin ? "bg-primary" : isLoss ? "bg-destructive" : "bg-muted-foreground"}`}
                    />
                    {trade.result?.toUpperCase() || "UNKNOWN"}
                  </div>
                  {trade.session && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {trade.session}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(tradeDate, "EEEE, MMMM d, yyyy")}
                  {trade.timeframe ? ` · ${trade.timeframe}` : ""}
                </p>
              </div>

              {/* ROI pill */}
              <div
                className={`flex flex-col items-center justify-center px-6 py-4 rounded-2xl border shrink-0 ${
                  roi > 0
                    ? "border-primary/25 bg-primary/5"
                    : roi < 0
                      ? "border-destructive/25 bg-destructive/5"
                      : "border-border bg-muted/20"
                }`}
              >
                <p
                  className={`text-4xl sm:text-5xl font-extrabold tabular-nums leading-none ${
                    roi > 0
                      ? "text-primary"
                      : roi < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {roi > 0 ? "+" : ""}
                  {roi.toFixed(2)}%
                </p>
                {pnl !== 0 && (
                  <p
                    className={`text-sm font-bold mt-1.5 ${pnl > 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {pnl > 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                  </p>
                )}
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  ROI
                </p>
              </div>
            </div>

            {/* Tag chips */}
            {(trade.setup || trade.emotion || trade.market_condition) && (
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border/60">
                {trade.setup && (
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                    📐 {trade.setup}
                  </span>
                )}
                {trade.emotion && (
                  <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground capitalize">
                    🧠 {trade.emotion}
                  </span>
                )}
                {trade.market_condition && (
                  <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground capitalize">
                    📊 {trade.market_condition}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Price grid */}
        <motion.div
          {...fadeUp(0.08)}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatBox label="Entry" value={trade.entry ?? null} />
          <StatBox label="Exit" value={trade.exit ?? null} />
          <StatBox
            label="Stop Loss"
            value={trade.stop_loss ?? null}
            color="text-destructive"
          />
          <StatBox
            label="Take Profit"
            value={trade.take_profit ?? null}
            color="text-primary"
          />
        </motion.div>

        {/* Secondary stats */}
        <motion.div
          {...fadeUp(0.12)}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {trade.position_size && (
            <StatBox label="Position Size" value={trade.position_size} />
          )}
          {trade.commission && (
            <StatBox label="Commission" value={`$${trade.commission}`} />
          )}
          {trade.account_balance && (
            <StatBox
              label="Account Balance"
              value={`$${trade.account_balance}`}
            />
          )}
          {rrRatio && (
            <StatBox
              label="R:R Ratio"
              value={`${rrRatio}:1`}
              color={
                parseFloat(rrRatio) >= 1.5 ? "text-primary" : "text-amber-500"
              }
            />
          )}
          {trade.confidence && (
            <StatBox label="Confidence" value={`${trade.confidence}/10`} />
          )}
          {trade.rating && (
            <StatBox label="Execution" value={`${trade.rating}/5 ⭐`} />
          )}
        </motion.div>

        {/* Trade details section */}
        <SectionCard title="Trade Details" icon={Activity} delay={0.16}>
          <InfoRow
            label="Date"
            value={format(tradeDate, "MMMM d, yyyy")}
            icon={Calendar}
          />
          <InfoRow label="Session" value={trade.session} icon={Clock} />
          <InfoRow label="Timeframe" value={trade.timeframe} icon={Clock} />
          <InfoRow
            label="Direction"
            value={
              trade.trade_type
                ? trade.trade_type.charAt(0).toUpperCase() +
                  trade.trade_type.slice(1)
                : null
            }
            icon={TrendingUp}
          />
          <InfoRow
            label="Market Condition"
            value={trade.market_condition}
            icon={Activity}
          />
          <InfoRow label="Setup / Pattern" value={trade.setup} icon={Target} />
          <InfoRow label="Emotional State" value={trade.emotion} icon={Brain} />
        </SectionCard>

        {/* Confluence */}
        {confluenceTags.length > 0 && (
          <motion.div
            {...fadeUp(0.2)}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-sm font-bold text-foreground mb-3">
              Confluence Factors
            </p>
            <div className="flex flex-wrap gap-2">
              {confluenceTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Notes */}
        {trade.notes && (
          <SectionCard title="Trade Notes" icon={StickyNote} delay={0.22}>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap py-4">
              {trade.notes}
            </p>
          </SectionCard>
        )}

        {/* Screenshot */}
        {trade.screenshot_url && (
          <motion.div
            {...fadeUp(0.26)}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60 bg-muted/30">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm font-bold">Chart Screenshot</p>
            </div>
            <div className="p-4">
              <img
                src={trade.screenshot_url}
                alt="Trade chart"
                className="w-full rounded-xl border border-border object-contain max-h-[500px]"
                loading="lazy"
              />
            </div>
          </motion.div>
        )}

        {/* Trade ID */}
        <motion.div
          {...fadeUp(0.28)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border/60 bg-muted/20"
        >
          <Hash className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <p className="text-[10px] text-muted-foreground/60 font-mono break-all">
            Trade ID: {trade.id}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
