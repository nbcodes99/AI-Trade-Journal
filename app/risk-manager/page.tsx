"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format, startOfDay, startOfWeek } from "date-fns";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calculator,
  Save,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Target,
  Zap,
  Clock,
  BarChart2,
  Plus,
  Trash2,
  Info,
  ChevronRight,
  Activity,
  Lock,
} from "lucide-react";
import Footer from "../components/Footer";

// ── types ────────────────────────────────────────────────────────────────────
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

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "1", label: "R:R is at least my minimum ratio", checked: false },
  { id: "2", label: "I have NOT hit my daily loss limit", checked: false },
  { id: "3", label: "My emotional state is calm or confident", checked: false },
  { id: "4", label: "Setup matches my defined strategy", checked: false },
  { id: "5", label: "I am within my max trades for today", checked: false },
  { id: "6", label: "Market condition suits this setup", checked: false },
];

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

const RuleProgress = ({
  label,
  used,
  limit,
  unit = "",
  invert = false,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  invert?: boolean;
  icon: any;
}) => {
  const pct = clamp((Math.abs(used) / limit) * 100, 0, 100);
  const status = getStatus(Math.abs(used), limit);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={`h-3.5 w-3.5 ${
              status === "safe"
                ? "text-primary"
                : status === "warning"
                  ? "text-amber-500"
                  : "text-destructive"
            }`}
          />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {used.toFixed(invert ? 0 : 2)}
            {unit} / {limit}
            {unit}
          </span>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === "safe"
              ? "bg-primary"
              : status === "warning"
                ? "bg-amber-500"
                : "bg-destructive"
          }`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-amber-500/40"
          style={{ left: "70%" }}
        />
      </div>
    </div>
  );
};

export default function RiskManager() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [rules, setRules] = useState<RiskRules>(DEFAULT_RULES);
  const [savedRules, setSavedRules] = useState<RiskRules>(DEFAULT_RULES);
  const [savingRules, setSavingRules] = useState(false);
  const [loadingRules, setLoadingRules] = useState(true);
  const [trades, setTrades] = useState<any[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [checklist, setChecklist] =
    useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [newCheckItem, setNewCheckItem] = useState("");

  const [calcEntry, setCalcEntry] = useState("");
  const [calcStop, setCalcStop] = useState("");
  const [calcRiskPct, setCalcRiskPct] = useState("");
  const [calcBalance, setCalcBalance] = useState("");

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoadingRules(true);
      const { data } = await supabase
        .from("risk_rules")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (data) {
        const r = {
          account_balance:
            data.account_balance ?? DEFAULT_RULES.account_balance,
          max_risk_per_trade_pct:
            data.max_risk_per_trade_pct ?? DEFAULT_RULES.max_risk_per_trade_pct,
          max_daily_loss_pct:
            data.max_daily_loss_pct ?? DEFAULT_RULES.max_daily_loss_pct,
          max_weekly_drawdown_pct:
            data.max_weekly_drawdown_pct ??
            DEFAULT_RULES.max_weekly_drawdown_pct,
          max_trades_per_day:
            data.max_trades_per_day ?? DEFAULT_RULES.max_trades_per_day,
          min_rr_ratio: data.min_rr_ratio ?? DEFAULT_RULES.min_rr_ratio,
          max_position_size:
            data.max_position_size ?? DEFAULT_RULES.max_position_size,
        };
        setRules(r);
        setSavedRules(r);
      }
      setLoadingRules(false);
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoadingTrades(true);
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setTrades(data || []);
      setLoadingTrades(false);
    };
    load();
  }, [userId]);

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

  const todayStart = startOfDay(new Date());
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const todayTrades = trades.filter(
    (t) => new Date(t.created_at || t.date) >= todayStart,
  );
  const weekTrades = trades.filter(
    (t) => new Date(t.created_at || t.date) >= weekStart,
  );

  const getRoi = (t: any) => {
    const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
    return isNaN(r) ? 0 : r;
  };
  const getPnl = (t: any) => {
    const p = typeof t.pnl === "string" ? parseFloat(t.pnl) : t.pnl;
    return isNaN(p) ? 0 : p;
  };

  const todayPnL = todayTrades.reduce((a, t) => a + getPnl(t), 0);
  const todayPnLPct =
    savedRules.account_balance > 0
      ? Math.abs(todayPnL / savedRules.account_balance) * 100
      : 0;
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

  const overallStatus: "safe" | "warning" | "breach" =
    dailyStatus === "breach" ||
    weekStatus === "breach" ||
    tradeCountStatus === "breach"
      ? "breach"
      : dailyStatus === "warning" ||
          weekStatus === "warning" ||
          tradeCountStatus === "warning"
        ? "warning"
        : "safe";

  const calcResults = useMemo(() => {
    const entry = parseFloat(calcEntry);
    const stop = parseFloat(calcStop);
    const riskPct = parseFloat(calcRiskPct) || rules.max_risk_per_trade_pct;
    const balance = parseFloat(calcBalance) || rules.account_balance;
    if (!entry || !stop || !balance) return null;
    const riskAmount = (riskPct / 100) * balance;
    const pipRisk = Math.abs(entry - stop);
    if (pipRisk === 0) return null;
    const positionSize = riskAmount / pipRisk;
    const rrEntry = { entry, stop };
    return { riskAmount, pipRisk, positionSize, riskPct, balance };
  }, [calcEntry, calcStop, calcRiskPct, calcBalance, rules]);

  const toggleCheck = (id: string) =>
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: newCheckItem.trim(),
        checked: false,
      },
    ]);
    setNewCheckItem("");
  };
  const removeCheckItem = (id: string) =>
    setChecklist((prev) => prev.filter((i) => i.id !== id));
  const resetChecklist = () =>
    setChecklist((prev) => prev.map((i) => ({ ...i, checked: false })));

  const checkedCount = checklist.filter((i) => i.checked).length;
  const allChecked = checkedCount === checklist.length;

  const setRule = (key: keyof RiskRules, val: number) =>
    setRules((r) => ({ ...r, [key]: val }));

  const rulesChanged = JSON.stringify(rules) !== JSON.stringify(savedRules);

  return (
    <>
      <section className="min-h-screen bg-background">
        <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">
                  Risk Manager
                </h1>
                <div
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    overallStatus === "safe"
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : overallStatus === "warning"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        : "border-destructive/20 bg-destructive/10 text-destructive"
                  }`}
                >
                  <StatusDot status={overallStatus} />
                  {overallStatus === "safe"
                    ? "All Systems Safe"
                    : overallStatus === "warning"
                      ? "Approaching Limits"
                      : "Limit Breached — Stop Trading"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define your rules. Protect your capital. Trade with discipline.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2 font-semibold"
              onClick={handleSaveRules}
              disabled={savingRules || !rulesChanged}
            >
              {savingRules ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Rules
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Daily Loss",
                value:
                  todayPnL < 0 ? `−$${Math.abs(todayPnL).toFixed(2)}` : "$0.00",
                sub: `Limit: −$${dailyLossLimit.toFixed(2)} (${savedRules.max_daily_loss_pct}%)`,
                status: dailyStatus,
                icon: TrendingDown,
                progress:
                  todayPnL < 0
                    ? (Math.abs(todayPnL) / dailyLossLimit) * 100
                    : 0,
              },
              {
                label: "Weekly Drawdown",
                value: `${weekRoi.toFixed(2)}%`,
                sub: `Limit: ${savedRules.max_weekly_drawdown_pct}%`,
                status: weekStatus,
                icon: BarChart2,
                progress: (weekRoi / savedRules.max_weekly_drawdown_pct) * 100,
              },
              {
                label: "Trades Today",
                value: `${todayCount} / ${savedRules.max_trades_per_day}`,
                sub: `Max ${savedRules.max_trades_per_day} trades per day`,
                status: tradeCountStatus,
                icon: Activity,
                progress: (todayCount / savedRules.max_trades_per_day) * 100,
              },
            ].map((s) => (
              <Card
                key={s.label}
                className={`border relative overflow-hidden ${
                  s.status === "breach"
                    ? "border-destructive/30"
                    : s.status === "warning"
                      ? "border-amber-500/30"
                      : "border-border"
                }`}
              >
                {s.status === "breach" && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-destructive" />
                )}
                {s.status === "warning" && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500" />
                )}
                {s.status === "safe" && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        s.status === "safe"
                          ? "bg-primary/15"
                          : s.status === "warning"
                            ? "bg-amber-500/15"
                            : "bg-destructive/15"
                      }`}
                    >
                      <s.icon
                        className={`h-4 w-4 ${
                          s.status === "safe"
                            ? "text-primary"
                            : s.status === "warning"
                              ? "text-amber-500"
                              : "text-destructive"
                        }`}
                      />
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {s.label}
                  </p>
                  <p
                    className={`text-2xl font-extrabold mb-1 ${
                      s.status === "safe"
                        ? "text-foreground"
                        : s.status === "warning"
                          ? "text-amber-500"
                          : "text-destructive"
                    }`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">{s.sub}</p>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        s.status === "safe"
                          ? "bg-primary"
                          : s.status === "warning"
                            ? "bg-amber-500"
                            : "bg-destructive"
                      }`}
                      style={{ width: `${clamp(s.progress, 0, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">
                        Risk Rules
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Set your trading guardrails
                      </p>
                    </div>
                    {rulesChanged && (
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] border-amber-500/40 text-amber-500"
                      >
                        Unsaved changes
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Account Balance ($)
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Used to calculate dollar-based limits
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
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
                        className="pl-7 h-10 font-mono font-semibold text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        key: "max_risk_per_trade_pct" as keyof RiskRules,
                        label: "Max Risk Per Trade",
                        unit: "%",
                        description: "% of account risked on a single trade",
                        min: 0.1,
                        max: 10,
                        step: 0.1,
                      },
                      {
                        key: "max_daily_loss_pct" as keyof RiskRules,
                        label: "Max Daily Loss",
                        unit: "%",
                        description: "Stop trading when this % is lost today",
                        min: 0.5,
                        max: 20,
                        step: 0.5,
                      },
                      {
                        key: "max_weekly_drawdown_pct" as keyof RiskRules,
                        label: "Max Weekly Drawdown",
                        unit: "%",
                        description: "Maximum total loss allowed this week",
                        min: 1,
                        max: 30,
                        step: 0.5,
                      },
                      {
                        key: "max_trades_per_day" as keyof RiskRules,
                        label: "Max Trades / Day",
                        unit: "",
                        description: "Maximum number of trades per session",
                        min: 1,
                        max: 20,
                        step: 1,
                      },
                      {
                        key: "min_rr_ratio" as keyof RiskRules,
                        label: "Minimum R:R Ratio",
                        unit: ":1",
                        description: "Only take trades with this R:R or better",
                        min: 0.5,
                        max: 10,
                        step: 0.5,
                      },
                      {
                        key: "max_position_size" as keyof RiskRules,
                        label: "Max Position Size",
                        unit: "%",
                        description: "Max % of account in a single position",
                        min: 1,
                        max: 100,
                        step: 1,
                      },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {field.label}
                        </label>
                        <p className="text-[10px] text-muted-foreground">
                          {field.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={rules[field.key]}
                            onChange={(e) =>
                              setRule(
                                field.key,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="h-10 font-mono font-semibold flex-1"
                          />
                          {field.unit && (
                            <span className="text-sm font-bold text-muted-foreground w-8 shrink-0">
                              {field.unit}
                            </span>
                          )}
                        </div>
                        {/* Visual slider */}
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={rules[field.key]}
                          onChange={(e) =>
                            setRule(field.key, parseFloat(e.target.value))
                          }
                          className="w-full h-1.5 rounded-full accent-primary cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">
                        Live Rule Status
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Today's performance vs your rules
                      </p>
                    </div>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {format(new Date(), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <RuleProgress
                    label="Daily Loss Used"
                    used={todayPnL < 0 ? Math.abs(todayPnL) : 0}
                    limit={dailyLossLimit}
                    unit="$"
                    icon={TrendingDown}
                  />
                  <RuleProgress
                    label="Weekly Drawdown"
                    used={weekRoi}
                    limit={savedRules.max_weekly_drawdown_pct}
                    unit="%"
                    icon={BarChart2}
                  />
                  <RuleProgress
                    label="Trades Today"
                    used={todayCount}
                    limit={savedRules.max_trades_per_day}
                    invert
                    icon={Activity}
                  />

                  {overallStatus === "breach" && (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-destructive">
                          Rule Limit Breached
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          You have hit one or more of your defined risk limits.
                          Stop trading for today and review your journal.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Calculator className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">
                        Position Calculator
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Size your trades correctly
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Account Balance ($)",
                      value: calcBalance,
                      set: setCalcBalance,
                      placeholder: rules.account_balance.toString(),
                      prefix: "$",
                    },
                    {
                      label: "Risk % Per Trade",
                      value: calcRiskPct,
                      set: setCalcRiskPct,
                      placeholder: rules.max_risk_per_trade_pct.toString(),
                      suffix: "%",
                    },
                    {
                      label: "Entry Price",
                      value: calcEntry,
                      set: setCalcEntry,
                      placeholder: "e.g. 76000",
                    },
                    {
                      label: "Stop Loss Price",
                      value: calcStop,
                      set: setCalcStop,
                      placeholder: "e.g. 75500",
                    },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {f.label}
                      </label>
                      <div className="relative">
                        {f.prefix && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {f.prefix}
                          </span>
                        )}
                        <Input
                          type="number"
                          value={f.value}
                          onChange={(e) => f.set(e.target.value)}
                          placeholder={f.placeholder}
                          className={`h-9 font-mono text-sm ${f.prefix ? "pl-7" : ""} ${f.suffix ? "pr-7" : ""}`}
                        />
                        {f.suffix && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {f.suffix}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {calcResults ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 mt-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        Result
                      </p>
                      {[
                        {
                          label: "Risk Amount",
                          value: `$${calcResults.riskAmount.toFixed(2)}`,
                        },
                        {
                          label: "Price Distance",
                          value: calcResults.pipRisk.toFixed(5),
                        },
                        {
                          label: "Position Size",
                          value: calcResults.positionSize.toFixed(4),
                        },
                      ].map((r) => (
                        <div
                          key={r.label}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-muted-foreground">
                            {r.label}
                          </span>
                          <span className="text-sm font-extrabold text-foreground font-mono">
                            {r.value}
                          </span>
                        </div>
                      ))}
                      <Separator />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Position Size = Risk $ ÷ |Entry − Stop|
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                      <Calculator className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">
                        Fill in all fields to calculate
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      setCalcEntry("");
                      setCalcStop("");
                      setCalcRiskPct("");
                      setCalcBalance("");
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                </CardContent>
              </Card>

              {/* Pre-Trade Checklist */}
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

                  {/* Progress */}
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          allChecked
                            ? "bg-primary"
                            : checkedCount > checklist.length / 2
                              ? "bg-amber-500"
                              : "bg-muted-foreground/40"
                        }`}
                        style={{
                          width: `${checklist.length > 0 ? (checkedCount / checklist.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    {allChecked && checklist.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        All checks passed — you're clear to trade
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 group ${
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
                        {item.checked && <CheckCircle2 className="h-3 w-3" />}
                      </button>
                      <span
                        className={`flex-1 text-xs leading-relaxed transition-colors ${
                          item.checked
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                      <button
                        onClick={() => removeCheckItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add item */}
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Add checklist item..."
                      value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCheckItem()}
                      className="h-9 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addCheckItem}
                      className="h-9 w-9 p-0 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Active Rules:
                  </span>
                </div>
                {[
                  `${savedRules.max_risk_per_trade_pct}% risk/trade`,
                  `${savedRules.max_daily_loss_pct}% daily stop`,
                  `${savedRules.max_weekly_drawdown_pct}% weekly limit`,
                  `${savedRules.max_trades_per_day} trades/day max`,
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
        </div>
      </section>
      {/* <Footer /> */}
    </>
  );
}
