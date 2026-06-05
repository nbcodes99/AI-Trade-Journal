"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle,
} from "lucide-react";
import {
  getTradeRoi,
  getTradePnl,
  getTradeDate,
  type Trade,
} from "@/lib/tradeCalculations";

function DetailRow({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: any;
  color?: string;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        {label}
      </div>
      <span
        className={`text-sm font-semibold text-right max-w-[60%] truncate ${color || "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60 bg-muted/20">
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
  const { session } = useAuth();
  const userId = session?.user?.id;

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading trade...</p>
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

  // Confluence tags
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

  return (
    <section className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Trade
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this trade and all its data from
                  your journal. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.07),transparent)] pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                  {trade.asset || "Unknown"}
                </h1>
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    isWin
                      ? "bg-primary/15 text-primary"
                      : isLoss
                        ? "bg-destructive/15 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${isWin ? "bg-primary" : isLoss ? "bg-destructive" : "bg-muted-foreground"}`}
                  />
                  {trade.result?.toUpperCase() || "—"}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(tradeDate, "EEEE, MMMM d, yyyy")}
                {trade.session ? ` · ${trade.session} session` : ""}
                {trade.timeframe ? ` · ${trade.timeframe}` : ""}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-4xl font-extrabold tabular-nums ${roi > 0 ? "text-primary" : roi < 0 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {roi > 0 ? "+" : ""}
                {roi.toFixed(2)}%
              </p>
              {pnl !== 0 && (
                <p
                  className={`text-sm font-semibold mt-1 ${pnl > 0 ? "text-primary" : "text-destructive"}`}
                >
                  {pnl > 0 ? "+" : ""}${pnl.toFixed(2)} P&L
                </p>
              )}
            </div>
          </div>

          {/* Quick chips */}
          {(trade.setup || trade.emotion) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/60">
              {trade.setup && (
                <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  {trade.setup}
                </span>
              )}
              {trade.emotion && (
                <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground capitalize">
                  {trade.emotion}
                </span>
              )}
              {trade.market_condition && (
                <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground capitalize">
                  {trade.market_condition}
                </span>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/20"
        >
          <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground font-mono truncate">
            {trade.id}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Section title="Price & Position" icon={DollarSign}>
              <DetailRow
                label="Entry Price"
                value={trade.entry}
                icon={TrendingUp}
              />
              <DetailRow
                label="Exit Price"
                value={trade.exit}
                icon={TrendingDown}
              />
              <DetailRow
                label="Stop Loss"
                value={trade.stop_loss}
                icon={AlertTriangle}
              />
              <DetailRow
                label="Take Profit"
                value={trade.take_profit}
                icon={Target}
              />
              <DetailRow
                label="Position Size"
                value={trade.position_size}
                icon={Activity}
              />
              <DetailRow
                label="Commission / Fees"
                value={trade.commission ? `$${trade.commission}` : null}
                icon={DollarSign}
              />
              <DetailRow
                label="Account Balance (pre-trade)"
                value={
                  trade.account_balance ? `$${trade.account_balance}` : null
                }
                icon={DollarSign}
              />
              <DetailRow
                label="P&L"
                value={
                  pnl !== 0 ? `${pnl > 0 ? "+" : ""}$${pnl.toFixed(2)}` : null
                }
                icon={DollarSign}
                color={pnl > 0 ? "text-primary" : "text-destructive"}
              />
              <DetailRow
                label="ROI"
                value={
                  roi !== 0 ? `${roi > 0 ? "+" : ""}${roi.toFixed(2)}%` : null
                }
                icon={BarChart2}
                color={roi > 0 ? "text-primary" : "text-destructive"}
              />
            </Section>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Section title="Trade Identity" icon={Calendar}>
              <DetailRow
                label="Date"
                value={format(tradeDate, "MMM d, yyyy")}
                icon={Calendar}
              />
              <DetailRow label="Session" value={trade.session} icon={Clock} />
              <DetailRow
                label="Timeframe"
                value={trade.timeframe}
                icon={Clock}
              />
              <DetailRow
                label="Market Condition"
                value={trade.market_condition}
                icon={Activity}
              />
              <DetailRow
                label="Direction"
                value={
                  trade.trade_type
                    ? trade.trade_type.charAt(0).toUpperCase() +
                      trade.trade_type.slice(1)
                    : null
                }
                icon={TrendingUp}
              />
            </Section>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Section title="Strategy & Psychology" icon={Brain}>
              <DetailRow
                label="Setup / Pattern"
                value={trade.setup}
                icon={Target}
              />
              <DetailRow
                label="Emotional State"
                value={trade.emotion}
                icon={Brain}
              />
              <DetailRow
                label="Pre-Trade Confidence"
                value={trade.confidence ? `${trade.confidence}/10` : null}
                icon={Zap}
              />
              <DetailRow
                label="Execution Rating"
                value={trade.rating ? `${trade.rating}/5 ⭐` : null}
                icon={Zap}
              />
              {confluenceTags.length > 0 && (
                <div className="py-3 border-b border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    Confluence Factors
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {confluenceTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          </motion.div>

          {trade.notes && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Section title="Trade Notes" icon={StickyNote}>
                <p className="text-sm text-foreground leading-relaxed py-4 whitespace-pre-wrap">
                  {trade.notes}
                </p>
              </Section>
            </motion.div>
          )}

          {trade.screenshot_url && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60 bg-muted/20">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Chart Screenshot
                  </p>
                </div>
                <div className="p-4">
                  <img
                    src={trade.screenshot_url}
                    alt="Trade chart screenshot"
                    className="w-full rounded-xl border border-border object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
