export interface Trade {
  id: string;
  result: string;
  roi: number | string | null;
  pnl: number | string | null;
  entry: number | string | null;
  exit: number | string | null;
  position_size: number | string | null;
  commission: number | string | null;
  account_balance: number | string | null;
  trade_type: string | null;
  stop_loss: number | string | null;
  take_profit: number | string | null;
  created_at: string;
  date: string | null;
  [key: string]: any;
}

export const parseNum = (val: any): number => {
  if (val === null || val === undefined || val === "") return 0;
  const n = typeof val === "string" ? parseFloat(val) : Number(val);
  return isNaN(n) ? 0 : n;
};

export const getTradeDate = (trade: Trade): Date =>
  new Date(trade.date || trade.created_at);

export const getTradeRoi = (trade: Trade): number => {
  if (trade.roi !== null && trade.roi !== undefined && trade.roi !== "") {
    return parseNum(trade.roi);
  }

  const entry = parseNum(trade.entry);
  const exit = parseNum(trade.exit);
  const posSize = parseNum(trade.position_size);
  const commission = parseNum(trade.commission);
  const balance = parseNum(trade.account_balance);

  if (!entry || !exit || !balance) return 0;

  const direction = trade.trade_type === "short" ? -1 : 1;
  const pnl = (exit - entry) * direction * posSize - commission;

  return (pnl / balance) * 100;
};

// Add to app/lib/tradeCalculations.ts

export interface RiskRules {
  account_balance: number;
  max_risk_per_trade_pct: number;
  max_daily_loss_pct: number;
  max_weekly_drawdown_pct: number;
  max_trades_per_day: number;
  min_rr_ratio: number;
  max_position_size: number;
}

/**
 * Analyzes how well a trader followed their own risk rules across all trades.
 * Returns violation counts and an overall discipline score.
 */
export const calcRiskCompliance = (trades: Trade[], rules: RiskRules) => {
  if (!trades.length || !rules) {
    return {
      rrViolations: 0,
      rrViolationRate: 0,
      oversizedTrades: 0,
      oversizedRate: 0,
      avgRiskPerTrade: 0,
      maxRiskTaken: 0,
      tradesOverRiskLimit: 0,
      disciplineScore: 0,
      daysOverTradeLimit: 0,
    };
  }

  let rrViolations = 0;
  let oversizedTrades = 0;
  let tradesOverRiskLimit = 0;
  let totalRiskPct = 0;
  let maxRiskTaken = 0;
  let validRiskCount = 0;

  trades.forEach((t) => {
    const entry = parseNum(t.entry);
    const stop = parseNum(t.stop_loss);
    const tp = parseNum(t.take_profit);
    const posSize = parseNum(t.position_size);
    const balance = parseNum(t.account_balance) || rules.account_balance;

    // Check R:R compliance
    if (entry && stop && tp) {
      const risk = Math.abs(entry - stop);
      const reward = Math.abs(tp - entry);
      if (risk > 0) {
        const rr = reward / risk;
        if (rr < rules.min_rr_ratio) rrViolations++;
      }
    }

    // Check risk % per trade
    if (entry && stop && posSize && balance) {
      const riskAmount = Math.abs(entry - stop) * posSize;
      const riskPct = (riskAmount / balance) * 100;
      totalRiskPct += riskPct;
      validRiskCount++;
      if (riskPct > maxRiskTaken) maxRiskTaken = riskPct;
      if (riskPct > rules.max_risk_per_trade_pct) tradesOverRiskLimit++;
    }

    // Check position size limit
    if (posSize && balance) {
      const posPct = (posSize / balance) * 100;
      if (posPct > rules.max_position_size) oversizedTrades++;
    }
  });

  // Check days where trade count exceeded limit
  const tradesByDay: Record<string, number> = {};
  trades.forEach((t) => {
    const day = getTradeDate(t).toDateString();
    tradesByDay[day] = (tradesByDay[day] || 0) + 1;
  });
  const daysOverTradeLimit = Object.values(tradesByDay).filter(
    (count) => count > rules.max_trades_per_day,
  ).length;

  const avgRiskPerTrade = validRiskCount ? totalRiskPct / validRiskCount : 0;

  // Discipline score (0-100): penalize violations
  const total = trades.length;
  const rrViolationRate = (rrViolations / total) * 100;
  const oversizedRate = (oversizedTrades / total) * 100;
  const riskLimitRate = (tradesOverRiskLimit / total) * 100;

  const disciplineScore = Math.max(
    0,
    Math.round(
      100 - rrViolationRate * 0.4 - oversizedRate * 0.3 - riskLimitRate * 0.3,
    ),
  );

  return {
    rrViolations,
    rrViolationRate: parseFloat(rrViolationRate.toFixed(1)),
    oversizedTrades,
    oversizedRate: parseFloat(oversizedRate.toFixed(1)),
    avgRiskPerTrade: parseFloat(avgRiskPerTrade.toFixed(2)),
    maxRiskTaken: parseFloat(maxRiskTaken.toFixed(2)),
    tradesOverRiskLimit,
    disciplineScore,
    daysOverTradeLimit,
  };
};

export const getTradePnl = (trade: Trade): number => {
  if (trade.pnl !== null && trade.pnl !== undefined && trade.pnl !== "") {
    return parseNum(trade.pnl);
  }

  const entry = parseNum(trade.entry);
  const exit = parseNum(trade.exit);
  const posSize = parseNum(trade.position_size);
  const commission = parseNum(trade.commission);

  if (!entry || !exit) return 0;

  const direction = trade.trade_type === "short" ? -1 : 1;

  return (exit - entry) * direction * posSize - commission;
};

export const calcWinRate = (trades: Trade[]): number => {
  if (!trades.length) return 0;
  const wins = trades.filter((t) => t.result === "win").length;
  return (wins / trades.length) * 100;
};

export const calcTotalRoi = (trades: Trade[]): number => {
  if (!trades.length) return 0;

  let equity = 100;

  trades.forEach((trade) => {
    equity *= 1 + getTradeRoi(trade) / 100;
  });

  return ((equity - 100) / 100) * 100;
};

export const calcAverageRoi = (trades: Trade[]): number => {
  if (!trades.length) return 0;

  return (
    trades.reduce((sum, trade) => sum + getTradeRoi(trade), 0) / trades.length
  );
};

export const calcBestTrade = (trades: Trade[]): number => {
  if (!trades.length) return 0;
  return Math.max(...trades.map((t) => getTradeRoi(t)));
};

export const calcWorstTrade = (trades: Trade[]): number => {
  if (!trades.length) return 0;
  return Math.min(...trades.map((t) => getTradeRoi(t)));
};

export const calcProfitFactor = (trades: Trade[]): string => {
  const wins = trades.filter((t) => t.result === "win");
  const losses = trades.filter((t) => t.result === "loss");
  const grossWins = wins.reduce((s, t) => s + getTradeRoi(t), 0);
  const grossLosses = Math.abs(losses.reduce((s, t) => s + getTradeRoi(t), 0));
  if (grossLosses === 0) return wins.length > 0 ? "∞" : "0";
  return (grossWins / grossLosses).toFixed(2);
};

export const calcAvgWin = (trades: Trade[]): number => {
  const wins = trades.filter((t) => t.result === "win");
  if (!wins.length) return 0;
  return wins.reduce((s, t) => s + getTradeRoi(t), 0) / wins.length;
};

export const calcAvgLoss = (trades: Trade[]): number => {
  const losses = trades.filter((t) => t.result === "loss");
  if (!losses.length) return 0;
  return Math.abs(
    losses.reduce((s, t) => s + getTradeRoi(t), 0) / losses.length,
  );
};

export const calcAvgRR = (trades: Trade[]): string => {
  const avgWin = calcAvgWin(trades);
  const avgLoss = calcAvgLoss(trades);
  if (!avgLoss) return "—";
  return (avgWin / avgLoss).toFixed(2);
};

export const calcExpectancy = (trades: Trade[]): number => {
  if (!trades.length) return 0;

  const winRate =
    trades.filter((t) => t.result === "win").length / trades.length;

  const avgWin = calcAvgWin(trades);
  const avgLoss = calcAvgLoss(trades);

  return winRate * avgWin - (1 - winRate) * avgLoss;
};

export const calcMaxDrawdown = (trades: Trade[]): number => {
  if (!trades.length) return 0;

  const sorted = [...trades].sort(
    (a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime(),
  );

  let equity = 100;
  let peak = 100;
  let maxDrawdown = 0;

  sorted.forEach((trade) => {
    equity *= 1 + getTradeRoi(trade) / 100;

    peak = Math.max(peak, equity);

    const drawdown = ((peak - equity) / peak) * 100;

    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  return maxDrawdown;
};

export const calcRecoveryFactor = (trades: Trade[]): string => {
  const totalRoi = calcTotalRoi(trades);
  const maxDrawdown = calcMaxDrawdown(trades);

  if (maxDrawdown === 0) {
    return totalRoi > 0 ? "∞" : "0";
  }

  return (totalRoi / maxDrawdown).toFixed(2);
};

export const calcStreaks = (trades: Trade[]) => {
  const sorted = [...trades].sort(
    (a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime(),
  );
  let bestStreak = 0,
    worstStreak = 0,
    curW = 0,
    curL = 0;
  sorted.forEach((t) => {
    if (t.result === "win") {
      curW++;
      curL = 0;
      if (curW > bestStreak) bestStreak = curW;
    } else if (t.result === "loss") {
      curL++;
      curW = 0;
      if (curL > worstStreak) worstStreak = curL;
    }
  });
  const last = sorted[sorted.length - 1];
  const currentStreak = last ? (last.result === "win" ? curW : -curL) : 0;
  return { bestStreak, worstStreak, currentStreak };
};

export const calcDailyLoss = (trades: Trade[], todayStart: Date): number => {
  const today = trades.filter((t) => getTradeDate(t) >= todayStart);
  const loss = today.reduce((s, t) => {
    const pnl = getTradePnl(t);
    return pnl < 0 ? s + Math.abs(pnl) : s;
  }, 0);
  return loss;
};

export const calcWeeklyDrawdown = (
  trades: Trade[],
  weekStart: Date,
): number => {
  const weekTrades = trades.filter((t) => getTradeDate(t) >= weekStart);

  return calcMaxDrawdown(weekTrades);
};

export const calcTradesToday = (trades: Trade[], todayStart: Date): number =>
  trades.filter((t) => getTradeDate(t) >= todayStart).length;

export const buildEquityCurve = (trades: Trade[]) => {
  const sorted = [...trades].sort(
    (a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime(),
  );
  let cumulative = 0;
  return sorted.map((t) => {
    cumulative += getTradeRoi(t);
    return {
      label: getTradeDate(t).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: parseFloat(cumulative.toFixed(2)),
    };
  });
};

export const calcAllStats = (trades: Trade[]) => {
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const winRate = calcWinRate(trades);
  const totalRoi = calcTotalRoi(trades);
  const averageRoi = calcAverageRoi(trades);
  const profitFactor = calcProfitFactor(trades);
  const avgWin = calcAvgWin(trades);
  const avgLoss = calcAvgLoss(trades);
  const avgRR = calcAvgRR(trades);
  const expectancy = calcExpectancy(trades);
  const maxDrawdown = calcMaxDrawdown(trades);
  const recoveryFactor = calcRecoveryFactor(trades);
  const bestTrade = calcBestTrade(trades);
  const worstTrade = calcWorstTrade(trades);
  const streaks = calcStreaks(trades);

  return {
    totalTrades,
    wins,
    losses,
    winRate,
    totalRoi,
    averageRoi,
    profitFactor,
    avgWin,
    avgLoss,
    avgRR,
    expectancy,
    maxDrawdown,
    recoveryFactor,
    bestTrade,
    worstTrade,
    ...streaks,
  };
};
