"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { startOfDay, startOfWeek } from "date-fns";

const DEFAULT_RULES = {
  account_balance: 10000,
  max_daily_loss_pct: 3,
  max_weekly_drawdown_pct: 6,
  max_trades_per_day: 3,
};

export function useRiskMonitor(userId: string | null) {
  const lastNotified = useRef<Record<string, number>>({});

  const canNotify = (key: string, cooldownMs = 5 * 60 * 1000) => {
    const last = lastNotified.current[key] || 0;
    const now = Date.now();
    if (now - last > cooldownMs) {
      lastNotified.current[key] = now;
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!userId) return;

    const check = async () => {
      const [rulesRes, tradesRes] = await Promise.all([
        supabase.from("risk_rules").select("*").eq("user_id", userId).single(),
        supabase
          .from("trades")
          .select("roi, pnl, result, created_at, date")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      const rules = rulesRes.data ?? DEFAULT_RULES;
      const trades = tradesRes.data || [];

      if (!rules || trades.length === 0) return;

      const todayStart = startOfDay(new Date());
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

      const todayTrades = trades.filter((t) => {
        const d = new Date(t.date || t.created_at);
        return d >= todayStart;
      });

      const weekTrades = trades.filter((t) => {
        const d = new Date(t.date || t.created_at);
        return d >= weekStart;
      });

      const getPnl = (t: any) => {
        const p = typeof t.pnl === "string" ? parseFloat(t.pnl) : t.pnl;
        return isNaN(p) ? 0 : p;
      };
      const getRoi = (t: any) => {
        const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
        return isNaN(r) ? 0 : r;
      };

      const todayPnL = todayTrades.reduce((a, t) => a + getPnl(t), 0);
      const weekRoi = Math.abs(weekTrades.reduce((a, t) => a + getRoi(t), 0));
      const todayCount = todayTrades.length;
      const dailyLossLimit =
        (rules.max_daily_loss_pct / 100) * rules.account_balance;

      const dailyUsedPct =
        Math.abs(todayPnL < 0 ? todayPnL : 0) / (dailyLossLimit || 1);

      if (dailyUsedPct >= 1 && canNotify("daily_breach")) {
        toast.error("🚨 Daily loss limit breached", {
          description: `You've hit your $${dailyLossLimit.toFixed(0)} daily limit. Stop trading for today.`,
          duration: 10000,
        });
      } else if (
        dailyUsedPct >= 0.7 &&
        dailyUsedPct < 1 &&
        canNotify("daily_warn")
      ) {
        toast.warning("⚠️ Approaching daily loss limit", {
          description: `You're at ${(dailyUsedPct * 100).toFixed(0)}% of your daily limit. Slow down.`,
          duration: 8000,
        });
      }

      const weekUsedPct = weekRoi / (rules.max_weekly_drawdown_pct || 1);

      if (weekUsedPct >= 1 && canNotify("week_breach")) {
        toast.error("🚨 Weekly drawdown limit hit", {
          description: `You've hit your ${rules.max_weekly_drawdown_pct}% weekly drawdown limit.`,
          duration: 10000,
        });
      } else if (
        weekUsedPct >= 0.7 &&
        weekUsedPct < 1 &&
        canNotify("week_warn")
      ) {
        toast.warning("⚠️ Weekly drawdown approaching limit", {
          description: `${weekRoi.toFixed(1)}% of ${rules.max_weekly_drawdown_pct}% weekly limit used.`,
          duration: 8000,
        });
      }

      if (
        todayCount >= rules.max_trades_per_day &&
        canNotify("trades_breach")
      ) {
        toast.error("🚨 Max trades reached for today", {
          description: `You've taken ${todayCount} trades — your daily limit. No more trades today.`,
          duration: 10000,
        });
      } else if (
        todayCount === rules.max_trades_per_day - 1 &&
        canNotify("trades_warn")
      ) {
        toast.warning("⚠️ One trade left for today", {
          description: `You've taken ${todayCount} of ${rules.max_trades_per_day} allowed trades today.`,
          duration: 8000,
        });
      }

      const recent = trades.slice(0, 5);
      let consecutiveLosses = 0;
      for (const t of recent) {
        if (t.result === "loss") consecutiveLosses++;
        else break;
      }

      if (
        consecutiveLosses >= 3 &&
        canNotify("consec_losses", 30 * 60 * 1000)
      ) {
        toast.warning("⚠️ 3+ consecutive losses detected", {
          description:
            "Consider stepping away. Revenge trading after losses is a common pattern.",
          duration: 10000,
        });
      }
    };

    check();
    const interval = setInterval(check, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);
}
