"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { startOfDay, startOfWeek } from "date-fns";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Save,
  RotateCcw,
  TrendingDown,
  Target,
  BarChart2,
  Plus,
  Trash2,
  Activity,
  Lock,
  Sparkles,
  Bell,
  Info,
} from "lucide-react";
import { Spinner } from "@radix-ui/themes";

interface RiskRules {
  account_balance: number;
  max_risk_per_trade_pct: number;
  max_daily_loss_pct: number;
  max_weekly_drawdown_pct: number;
  max_trades_per_day: number;
  min_rr_ratio: number;
  max_position_size: number;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const DEFAULT_RULES: RiskRules = {
  account_balance: 10000,
  max_risk_per_trade_pct: 1,
  max_daily_loss_pct: 3,
  max_weekly_drawdown_pct: 6,
  max_trades_per_day: 5,
  min_rr_ratio: 1.5,
  max_position_size: 10,
};

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

const getStatus = (
  used: number,
  limit: number,
): "safe" | "warning" | "breach" => {
  const pct = used / limit;
  if (pct >= 1) return "breach";
  if (pct >= 0.7) return "warning";
  return "safe";
};

const StatusBadge = ({ status }: { status: "safe" | "warning" | "breach" }) => (
  <Badge
    className={`text-[10px] font-bold uppercase tracking-wide ${
      status === "safe"
        ? "bg-primary/15 text-primary border-primary/20"
        : status === "warning"
          ? "bg-amber-500/15 text-amber-500 border-amber-500/20"
          : "bg-destructive/15 text-destructive border-destructive/20"
    }`}
    variant="outline"
  >
    {status === "safe" ? "Safe" : status === "warning" ? "Caution" : "Breached"}
  </Badge>
);

const StatusDot = ({ status }: { status: "safe" | "warning" | "breach" }) => (
  <span
    className={`inline-flex h-2 w-2 rounded-full ${
      status === "safe"
        ? "bg-primary"
        : status === "warning"
          ? "bg-amber-500"
          : "bg-destructive"
    }`}
  />
);

const LockedState = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <div className="border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-bold text-foreground">Risk Manager</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Advanced risk protection & position sizing
        </p>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full space-y-8">
        <div className="relative">
          <div className="space-y-4 blur-sm pointer-events-none select-none opacity-60">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold">Risk Rules</h3>
                </div>
                <div className="space-y-3">
                  {[1, 0.83, 0.67].map((w, i) => (
                    <div
                      key={i}
                      className="h-2 bg-muted rounded"
                      style={{ width: `${w * 100}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="h-2 bg-muted rounded w-2/3 mb-3" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-background/95 backdrop-blur-sm border border-border rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-auto"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-extrabold text-foreground mb-2">
                Pro Feature
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Get real-time risk alerts, position sizing, daily limit
                tracking, and a custom pre-trade checklist.
              </p>
              <Link href="/checkout">
                <Button className="w-full gap-2 font-bold h-11">
                  <Sparkles className="h-4 w-4" /> Upgrade to Pro
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                14-day money back · Cancel anytime
              </p>
            </motion.div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14">
          {[
            {
              icon: Shield,
              title: "Risk Rules",
              desc: "Set daily loss limits, max trades, and position sizing guardrails.",
            },
            {
              icon: Bell,
              title: "Live Alerts",
              desc: "Get notified on any page when you're approaching or breaching limits.",
            },
            {
              icon: Calculator,
              title: "Position Sizing",
              desc: "Calculate exact position sizes based on your risk per trade.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-4 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">
                {f.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function RiskManager() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [rules, setRules] = useState<RiskRules>(DEFAULT_RULES);
  const [savedRules, setSavedRules] = useState<RiskRules>(DEFAULT_RULES);
  const [savingRules, setSavingRules] = useState(false);
  const [loadingRules, setLoadingRules] = useState(true);
  const [trades, setTrades] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [checkingPro, setCheckingPro] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "rules" | "calculator" | "checklist"
  >("rules");

  const [calcEntry, setCalcEntry] = useState("");
  const [calcStop, setCalcStop] = useState("");
  const [calcRiskPct, setCalcRiskPct] = useState("");
  const [calcBalance, setCalcBalance] = useState("");
  const [calcTakeProfit, setCalcTakeProfit] = useState("");

  useEffect(() => {
    if (!session) {
      setIsPro(false);
      setCheckingPro(false);
      return;
    }
    const checkPlan = async () => {
      setCheckingPro(true);
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();
      setIsPro(data?.plan === "pro");
      setCheckingPro(false);
    };
    checkPlan();
  }, [session]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoadingRules(true);
      const [rulesRes, tradesRes, checklistRes] = await Promise.all([
        supabase.from("risk_rules").select("*").eq("user_id", userId).single(),
        supabase
          .from("trades")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("risk_checklist")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),
      ]);
      if (rulesRes.data) {
        const r = { ...DEFAULT_RULES, ...rulesRes.data };
        setRules(r);
        setSavedRules(r);
      }
      setTrades(tradesRes.data || []);
      setChecklist(
        checklistRes.data?.map((i: any) => ({
          id: i.id,
          label: i.label,
          checked: false,
        })) || [],
      );
      setLoadingRules(false);
    };
    load();
  }, [userId]);

  const getRoi = (t: any) => {
    const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return isNaN(r) ? 0 : r;
  };
  const getPnl = (t: any) => {
    const p = typeof t.pnl === "string" ? parseFloat(t.pnl) : t.pnl;
    return isNaN(p) ? 0 : p;
  };

  const todayStart = startOfDay(new Date());
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const todayTrades = trades.filter(
    (t) => new Date(t.created_at || t.date) >= todayStart,
  );
  const weekTrades = trades.filter(
    (t) => new Date(t.created_at || t.date) >= weekStart,
  );
  const todayPnL = todayTrades.reduce((a, t) => a + getPnl(t), 0);
  const weekRoi = Math.abs(weekTrades.reduce((a, t) => a + getRoi(t), 0));
  const todayCount = todayTrades.length;
  const dailyLossLimit =
    (savedRules.max_daily_loss_pct / 100) * savedRules.account_balance;

  const dailyStatus = getStatus(
    Math.abs(todayPnL < 0 ? todayPnL : 0),
    dailyLossLimit,
  );
  const weekStatus = getStatus(weekRoi, savedRules.max_weekly_drawdown_pct);
  const tradeCountStatus = getStatus(todayCount, savedRules.max_trades_per_day);
  const overallStatus: "safe" | "warning" | "breach" = [
    dailyStatus,
    weekStatus,
    tradeCountStatus,
  ].includes("breach")
    ? "breach"
    : [dailyStatus, weekStatus, tradeCountStatus].includes("warning")
      ? "warning"
      : "safe";

  const recentTrades = trades.slice(0, 5);
  const consecutiveLosses = (() => {
    let count = 0;
    for (const t of recentTrades) {
      if (t.result === "loss") count++;
      else break;
    }
    return count;
  })();

  const riskScore = Math.round(
    (1 -
      Math.min(
        Math.abs(todayPnL < 0 ? todayPnL : 0) / (dailyLossLimit || 1),
        1,
      )) *
      40 +
      (1 - Math.min(weekRoi / (savedRules.max_weekly_drawdown_pct || 1), 1)) *
        35 +
      (1 - Math.min(todayCount / (savedRules.max_trades_per_day || 1), 1)) * 25,
  );

  const calcResults = useMemo(() => {
    const entry = parseFloat(calcEntry);
    const stop = parseFloat(calcStop);
    const tp = parseFloat(calcTakeProfit);
    const riskPct = parseFloat(calcRiskPct) || rules.max_risk_per_trade_pct;
    const balance = parseFloat(calcBalance) || rules.account_balance;
    if (!entry || !stop || !balance) return null;
    const riskAmount = (riskPct / 100) * balance;
    const pipRisk = Math.abs(entry - stop);
    if (pipRisk === 0) return null;
    const positionSize = riskAmount / pipRisk;
    const potentialGain = tp ? Math.abs(tp - entry) * positionSize : null;
    const rrRatio = tp ? (Math.abs(tp - entry) / pipRisk).toFixed(2) : null;
    const meetsMinRR = rrRatio
      ? parseFloat(rrRatio) >= rules.min_rr_ratio
      : null;
    return {
      riskAmount,
      pipRisk,
      positionSize,
      potentialGain,
      rrRatio,
      meetsMinRR,
    };
  }, [calcEntry, calcStop, calcRiskPct, calcBalance, calcTakeProfit, rules]);

  const handleSaveRules = async () => {
    if (!userId) return;
    setSavingRules(true);
    const { error } = await supabase
      .from("risk_rules")
      .upsert({ user_id: userId, ...rules }, { onConflict: "user_id" });
    if (error) toast.error(error.message);
    else {
      toast.success("Risk rules saved!");
      setSavedRules(rules);
    }
    setSavingRules(false);
  };

  const addCheckItem = async () => {
    if (!newCheckItem.trim() || !userId) return;
    const label = newCheckItem.trim();
    const { data, error } = await supabase
      .from("risk_checklist")
      .insert({ user_id: userId, label })
      .select()
      .single();
    if (!error && data) {
      setChecklist((prev) => [...prev, { id: data.id, label, checked: false }]);
      setNewCheckItem("");
    }
  };

  const removeCheckItem = async (id: string) => {
    await supabase.from("risk_checklist").delete().eq("id", id);
    setChecklist((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleCheck = (id: string) =>
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );

  const resetChecklist = () =>
    setChecklist((prev) => prev.map((i) => ({ ...i, checked: false })));

  const checkedCount = checklist.filter((i) => i.checked).length;
  const allChecked = checklist.length > 0 && checkedCount === checklist.length;
  const setRule = (key: keyof RiskRules, val: number) =>
    setRules((r) => ({ ...r, [key]: val }));
  const rulesChanged = JSON.stringify(rules) !== JSON.stringify(savedRules);

  if (checkingPro || loadingRules) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center">
        <div className="text-center mt-44">
          <Spinner size="3" />
        </div>
      </div>
    );
  }

  if (!isPro) return <LockedState />;

  return (
    <section className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:gap-0 sm:flex-row sm:items-center sm:gap-3 w-full">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 shrink-0">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                <h1 className="text-xl font-bold text-foreground truncate">
                  Risk Manager
                </h1>
                <div
                  className={`inline-flex items-center gap-1.5 mb-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    overallStatus === "safe"
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : overallStatus === "warning"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        : "border-destructive/20 bg-destructive/10 text-destructive animate-pulse"
                  }`}
                >
                  <StatusDot status={overallStatus} />
                  {overallStatus === "safe"
                    ? "All Clear"
                    : overallStatus === "warning"
                      ? "Caution"
                      : "Stop Trading"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Protect capital · Trade with discipline
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full sm:w-auto gap-2 font-semibold"
            onClick={handleSaveRules}
            disabled={savingRules || !rulesChanged}
          >
            {savingRules ? (
              <span className="flex items-center gap-2 justify-center w-full">
                <span className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Rules
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card overflow-hidden"
        >
          <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="relative shrink-0">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={
                    riskScore >= 70
                      ? "hsl(var(--primary))"
                      : riskScore >= 40
                        ? "#f59e0b"
                        : "hsl(var(--destructive))"
                  }
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(riskScore / 100) * 251} 251`}
                  strokeDashoffset={63}
                  initial={{ strokeDasharray: "0 251" }}
                  animate={{
                    strokeDasharray: `${(riskScore / 100) * 251} 251`,
                  }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dy="0.35em"
                  fontSize="18"
                  fontWeight="700"
                  fill="hsl(var(--foreground))"
                >
                  {riskScore}
                </text>
              </svg>
              <p className="text-[10px] font-bold text-center mt-1 text-muted-foreground uppercase tracking-widest">
                Risk Health
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {[
                {
                  label: "Daily Loss",
                  icon: TrendingDown,
                  value:
                    todayPnL < 0
                      ? `-$${Math.abs(todayPnL).toFixed(2)}`
                      : "$0.00",
                  sub: `of $${dailyLossLimit.toFixed(0)} limit`,
                  status: dailyStatus,
                  pct:
                    todayPnL < 0
                      ? clamp(
                          (Math.abs(todayPnL) / dailyLossLimit) * 100,
                          0,
                          100,
                        )
                      : 0,
                },
                {
                  label: "Weekly Drawdown",
                  icon: BarChart2,
                  value: `${weekRoi.toFixed(2)}%`,
                  sub: `of ${savedRules.max_weekly_drawdown_pct}% limit`,
                  status: weekStatus,
                  pct: clamp(
                    (weekRoi / savedRules.max_weekly_drawdown_pct) * 100,
                    0,
                    100,
                  ),
                },
                {
                  label: "Trades Today",
                  icon: Activity,
                  value: `${todayCount} / ${savedRules.max_trades_per_day}`,
                  sub: "trades taken today",
                  status: tradeCountStatus,
                  pct: clamp(
                    (todayCount / savedRules.max_trades_per_day) * 100,
                    0,
                    100,
                  ),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl border p-4 space-y-2 ${
                    s.status === "breach"
                      ? "border-destructive/30 bg-destructive/5"
                      : s.status === "warning"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <s.icon
                        className={`h-3.5 w-3.5 ${s.status === "safe" ? "text-primary" : s.status === "warning" ? "text-amber-500" : "text-destructive"}`}
                      />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p
                    className={`text-xl font-extrabold ${s.status === "safe" ? "text-foreground" : s.status === "warning" ? "text-amber-500" : "text-destructive"}`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${s.status === "safe" ? "bg-primary" : s.status === "warning" ? "bg-amber-500" : "bg-destructive"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {(overallStatus !== "safe" || consecutiveLosses >= 3) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`border-t px-6 py-3 flex items-center gap-3 ${
                  overallStatus === "breach"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <AlertTriangle
                  className={`h-4 w-4 shrink-0 ${overallStatus === "breach" ? "text-destructive" : "text-amber-500"}`}
                />
                <p className="text-xs font-semibold text-foreground">
                  {overallStatus === "breach"
                    ? "🚨 You have breached one or more risk limits. Stop trading and review your journal."
                    : consecutiveLosses >= 3
                      ? `⚠️ ${consecutiveLosses} consecutive losses detected. Consider taking a break before your next trade.`
                      : "⚠️ You're approaching one or more risk limits. Reduce size or stop trading soon."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex gap-1 p-1 rounded-xl bg-muted/40 border border-border w-full sm:w-auto">
          {[
            { id: "rules", label: "Rules", icon: Shield },
            { id: "calculator", label: "Calculator", icon: Calculator },
            {
              id: "checklist",
              label: "Checklist",
              icon: CheckCircle2,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4 hidden sm:block" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "rules" && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Account Balance
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Base for all percentage calculations
                      </p>
                    </div>
                    {rulesChanged && (
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] border-amber-500/40 text-amber-500"
                      >
                        Unsaved
                      </Badge>
                    )}
                  </div>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                      $
                    </span>
                    <Input
                      type="number"
                      value={rules.account_balance}
                      onChange={(e) =>
                        setRule(
                          "account_balance",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="pl-7 h-11 font-mono font-semibold text-lg"
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: `Max Risk/Trade`,
                        value: `$${((rules.max_risk_per_trade_pct / 100) * rules.account_balance).toFixed(0)}`,
                      },
                      {
                        label: `Daily Stop`,
                        value: `$${((rules.max_daily_loss_pct / 100) * rules.account_balance).toFixed(0)}`,
                      },
                      {
                        label: `Weekly Limit`,
                        value: `$${((rules.max_weekly_drawdown_pct / 100) * rules.account_balance).toFixed(0)}`,
                      },
                      {
                        label: `Max Position`,
                        value: `$${((rules.max_position_size / 100) * rules.account_balance).toFixed(0)}`,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl bg-muted/40 border border-border/60 p-3"
                      >
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                          {s.label}
                        </p>
                        <p className="text-base font-extrabold text-primary mt-1">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: "max_risk_per_trade_pct" as keyof RiskRules,
                    label: "Max Risk Per Trade",
                    unit: "%",
                    desc: "% of account risked on a single trade",
                    min: 1,
                    max: 100,
                    step: 1,
                    warn: 20,
                  },
                  {
                    key: "max_daily_loss_pct" as keyof RiskRules,
                    label: "Max Daily Loss",
                    unit: "%",
                    desc: "Stop trading when this % is lost today",
                    min: 1,
                    max: 100,
                    step: 1,
                    warn: 20,
                  },
                  {
                    key: "max_weekly_drawdown_pct" as keyof RiskRules,
                    label: "Max Weekly Drawdown",
                    unit: "%",
                    desc: "Maximum total loss allowed this week",
                    min: 1,
                    max: 100,
                    step: 1,
                    warn: 40,
                  },
                  {
                    key: "max_trades_per_day" as keyof RiskRules,
                    label: "Max Trades / Day",
                    unit: "",
                    desc: "Maximum number of trades per session",
                    min: 1,
                    max: 20,
                    step: 1,
                    warn: 5,
                  },
                  {
                    key: "min_rr_ratio" as keyof RiskRules,
                    label: "Minimum R:R Ratio",
                    unit: ":1",
                    desc: "Only take trades with this R:R or better",
                    min: 0.5,
                    max: 20,
                    step: 0.5,
                    warn: 0,
                  },
                  {
                    key: "max_position_size" as keyof RiskRules,
                    label: "Max Position Size",
                    unit: "%",
                    desc: "Max % of account in a single position",
                    min: 1,
                    max: 100,
                    step: 1,
                    warn: 25,
                  },
                ].map((field) => {
                  const val = rules[field.key] as number;
                  const isRisky = field.warn > 0 && val > field.warn;
                  return (
                    <motion.div
                      key={field.key}
                      whileHover={{ scale: 1.01 }}
                      className={`rounded-2xl border p-4 space-y-3 transition-colors ${isRisky ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {field.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {field.desc}
                          </p>
                        </div>
                        <div
                          className={`text-lg font-extrabold ${isRisky ? "text-amber-500" : "text-primary"}`}
                        >
                          {val}
                          {field.unit}
                        </div>
                      </div>
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={val}
                        onChange={(e) =>
                          setRule(field.key, parseFloat(e.target.value))
                        }
                        className="w-full h-2 rounded-full cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>
                          {field.min}
                          {field.unit}
                        </span>
                        <span>
                          {field.max}
                          {field.unit}
                        </span>
                      </div>
                      {isRisky && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-500">
                          <AlertTriangle className="h-3 w-3" />
                          High risk setting — consider reducing
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-foreground">
                        Active Rules:
                      </span>
                    </div>
                    {[
                      `${savedRules.max_risk_per_trade_pct}% risk/trade`,
                      `${savedRules.max_daily_loss_pct}% daily stop`,
                      `${savedRules.max_weekly_drawdown_pct}% weekly limit`,
                      `${savedRules.max_trades_per_day} trades/day`,
                      `${savedRules.min_rr_ratio}:1 min R:R`,
                    ].map((rule) => (
                      <span
                        key={rule}
                        className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary"
                      >
                        <CheckCircle2 className="h-3 w-3" /> {rule}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "calculator" && (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Calculator className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold">
                          Position Size Calculator
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          P&L = (Exit − Entry) × Size − Commission
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          label: "Account Balance",
                          value: calcBalance,
                          set: setCalcBalance,
                          placeholder: rules.account_balance.toString(),
                          prefix: "$",
                        },
                        {
                          label: "Risk % Per Trade",
                          value: calcRiskPct,
                          set: setCalcRiskPct,
                          placeholder: `${rules.max_risk_per_trade_pct}`,
                          suffix: "%",
                        },
                        {
                          label: "Entry Price",
                          value: calcEntry,
                          set: setCalcEntry,
                          placeholder: "e.g. 76000",
                        },
                        {
                          label: "Stop Loss",
                          value: calcStop,
                          set: setCalcStop,
                          placeholder: "e.g. 75500",
                        },
                        {
                          label: "Take Profit",
                          value: calcTakeProfit,
                          set: setCalcTakeProfit,
                          placeholder: "e.g. 77000 (optional)",
                        },
                      ].map((f) => (
                        <div
                          key={f.label}
                          className={`space-y-1 ${f.label === "Take Profit" ? "col-span-2" : ""}`}
                        >
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {f.label}
                          </label>
                          <div className="relative">
                            {f.prefix && (
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {f.prefix}
                              </span>
                            )}
                            <Input
                              type="number"
                              value={f.value}
                              onChange={(e) => f.set(e.target.value)}
                              placeholder={f.placeholder}
                              className={`h-10 font-mono ${f.prefix ? "pl-7" : ""} ${f.suffix ? "pr-7" : ""}`}
                            />
                            {f.suffix && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {f.suffix}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        setCalcEntry("");
                        setCalcStop("");
                        setCalcRiskPct("");
                        setCalcBalance("");
                        setCalcTakeProfit("");
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className={`border ${calcResults ? (calcResults.meetsMinRR === false ? "border-amber-500/30 bg-amber-500/5" : "border-primary/20 bg-primary/5") : "border-border"}`}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold">Results</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Based on your inputs and saved rules
                    </p>
                  </CardHeader>
                  <CardContent>
                    {!calcResults ? (
                      <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                        <Calculator className="h-10 w-10 opacity-30" />
                        <p className="text-sm">
                          Fill in Balance, Entry, and Stop Loss to calculate
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[
                          {
                            label: "Position Size",
                            value: calcResults.positionSize.toFixed(4),
                            highlight: true,
                          },
                          {
                            label: "Risk Amount",
                            value: `$${calcResults.riskAmount.toFixed(2)}`,
                            highlight: false,
                          },
                          {
                            label: "Price Distance",
                            value: calcResults.pipRisk.toFixed(5),
                            highlight: false,
                          },
                          ...(calcResults.potentialGain !== null
                            ? [
                                {
                                  label: "Potential Gain",
                                  value: `$${calcResults.potentialGain.toFixed(2)}`,
                                  highlight: false,
                                },
                              ]
                            : []),
                          ...(calcResults.rrRatio !== null
                            ? [
                                {
                                  label: "R:R Ratio",
                                  value: `${calcResults.rrRatio}:1`,
                                  highlight: false,
                                },
                              ]
                            : []),
                        ].map((r) => (
                          <div
                            key={r.label}
                            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                          >
                            <span className="text-sm text-muted-foreground">
                              {r.label}
                            </span>
                            <span
                              className={`font-extrabold font-mono ${r.highlight ? "text-xl text-primary" : "text-base text-foreground"}`}
                            >
                              {r.value}
                            </span>
                          </div>
                        ))}

                        {calcResults.rrRatio !== null && (
                          <div
                            className={`rounded-xl p-3 flex items-center gap-2 ${calcResults.meetsMinRR ? "bg-primary/10 border border-primary/20" : "bg-amber-500/10 border border-amber-500/20"}`}
                          >
                            {calcResults.meetsMinRR ? (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                            )}
                            <p
                              className={`text-xs font-semibold ${calcResults.meetsMinRR ? "text-primary" : "text-amber-500"}`}
                            >
                              {calcResults.meetsMinRR
                                ? `R:R meets your ${rules.min_rr_ratio}:1 minimum — trade approved ✓`
                                : `R:R is below your ${rules.min_rr_ratio}:1 minimum — skip this trade`}
                            </p>
                          </div>
                        )}

                        <p className="text-[10px] text-muted-foreground">
                          Size = Risk$ ÷ |Entry − Stop|
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-border">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold">
                              Pre-Trade Checklist
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {checkedCount}/{checklist.length} complete
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={resetChecklist}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" /> Reset
                        </button>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                          <motion.div
                            animate={{
                              width: `${checklist.length > 0 ? (checkedCount / checklist.length) * 100 : 0}%`,
                            }}
                            transition={{ duration: 0.4 }}
                            className={`h-full rounded-full ${allChecked ? "bg-primary" : checkedCount > checklist.length / 2 ? "bg-amber-500" : "bg-muted-foreground/40"}`}
                          />
                        </div>
                        {allChecked && checklist.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1.5 text-xs text-primary font-semibold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> All checks
                            passed — you're clear to trade
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {checklist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                            <CheckCircle2 className="h-7 w-7 text-muted-foreground/40" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            No checklist items yet
                          </p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            Add your own pre-trade conditions below. These are
                            personal to you — what must be true before you take
                            a trade?
                          </p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {checklist.map((item, i) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 12 }}
                              transition={{ delay: i * 0.04 }}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-150 group ${
                                item.checked
                                  ? "border-primary/20 bg-primary/5"
                                  : "border-border bg-card hover:bg-muted/30"
                              }`}
                            >
                              <button
                                onClick={() => toggleCheck(item.id)}
                                className={`flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-full border-2 transition-all ${
                                  item.checked
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                {item.checked && (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                              </button>
                              <span
                                className={`flex-1 text-sm leading-relaxed transition-colors ${item.checked ? "text-muted-foreground line-through" : "text-foreground"}`}
                              >
                                {item.label}
                              </span>
                              <button
                                onClick={() => removeCheckItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Input
                          placeholder="e.g. R:R is at least 2:1, No news in next 30 mins..."
                          value={newCheckItem}
                          onChange={(e) => setNewCheckItem(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addCheckItem())
                          }
                          className="h-10"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={addCheckItem}
                          className="h-10 w-10 shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold">
                          What to add
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        // "Is my R:R at least 1:2?",
                        // "Have I NOT hit my daily loss limit?",
                        "Is my emotional state calm?",
                        "Does the setup match my strategy?",
                        // "Is there no major news event?",
                        "Am I trading in my best session?",
                        "Is the market condition clear?",
                        "Have I checked higher timeframe bias?",
                      ].map((tip) => (
                        <button
                          key={tip}
                          onClick={() => setNewCheckItem(tip)}
                          className="w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 group"
                        >
                          <Plus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          {tip}
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-foreground mb-1">
                            Live Alerts Active
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Glint monitors your risk limits in real-time and
                            notifies you anywhere in the app when you approach
                            or breach them — even if you're on a different page.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
