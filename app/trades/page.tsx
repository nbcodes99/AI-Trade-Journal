"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { format } from "date-fns";
import { ChevronDownIcon, FilePlusCorner, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DialogFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Trades() {
  const [date, setDate] = useState<Date | undefined>();
  const [setup, setSetup] = useState("");
  const [customSetup, setCustomSetup] = useState("");
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState("");
  const [emotion, setEmotion] = useState("");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [asset, setAsset] = useState("");
  const [confluenceTags, setConfluenceTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [marketCondition, setMarketCondition] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [confidence, setConfidence] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState<any[]>([]);

  const handleChangeSetup = (value: string) => {
    if (value === "other") {
      setOpen(true);
    } else {
      setSetup(value);
    }
  };

  const handleSaveSetup = () => {
    if (customSetup.trim() !== "") {
      setSetup(customSetup.trim());
    }
    setOpen(false);
    setCustomSetup("");
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag !== "" && !confluenceTags.includes(tag)) {
      setConfluenceTags((prev) => [...prev, tag]);
    }
    setNewTag("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    setConfluenceTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const entryNum = Number(entry);
    const exitNum = Number(exit);

    const roi =
      entryNum && exitNum
        ? tradeType === "long"
          ? ((exitNum - entryNum) / entryNum) * 100
          : ((entryNum - exitNum) / entryNum) * 100
        : 0;

    const result =
      entryNum && exitNum
        ? tradeType === "long"
          ? exitNum > entryNum
            ? "win"
            : "loss"
          : exitNum < entryNum
            ? "win"
            : "loss"
        : null;

    const newTrade = {
      user_id: user.id,
      date: date ? format(date, "yyyy-MM-dd") : null,
      asset: asset.trim() || null,
      trade_type: tradeType || null,
      entry: entryNum || null,
      exit: exitNum || null,
      setup: setup || null,
      confluence: confluenceTags.length ? confluenceTags : null,
      market_condition: marketCondition || null,
      timeframe: timeframe || null,
      confidence_level: confidence || null,
      emotion: emotion || null,
      roi,
      result,
    };

    const { error } = await supabase.from("trades").insert(newTrade);

    if (!error) {
      setTrades((prev) => [...prev, newTrade]);
      setDate(undefined);
      setSetup("");
      setCustomSetup("");
      setTradeType("");
      setEmotion("");
      setEntry("");
      setExit("");
      setAsset("");
      setConfluenceTags([]);
      setNewTag("");
      setMarketCondition("");
      setTimeframe("");
      setConfidence(5);
    }

    setLoading(false);
  };

  const fetchTrades = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error) {
      setTrades(data || []);
    }
  };

  return (
    <section className="flex flex-col items-center w-full max-w-4xl mx-auto px-2 mt-6">
      <h1 className="text-3xl font-bold mb-8">Trades</h1>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Add New Trade</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!date}
                className="w-full data-[empty=true]:text-muted-foreground justify-between text-left font-normal"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                defaultMonth={date}
              />
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Asset (eg. BTCUSD)"
            className="w-full"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
          />

          <Select onValueChange={setTradeType} value={tradeType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Long/Short" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Entry"
            className="w-full"
            type="number"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          <Input
            placeholder="Exit"
            className="w-full"
            type="number"
            value={exit}
            onChange={(e) => setExit(e.target.value)}
          />

          <Select onValueChange={handleChangeSetup} value={setup}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Setup" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakout">Breakout</SelectItem>
              <SelectItem value="pullback">Pullback</SelectItem>
              <SelectItem value="smc">SMC</SelectItem>
              <SelectItem value="support/resistance">
                Support/Resistance
              </SelectItem>
              <SelectItem value="range">Range</SelectItem>
              <SelectItem value="trend">Trend Continuation</SelectItem>
              <SelectItem value="reversal">Reversal</SelectItem>
              <SelectItem value="scalp">Scalp</SelectItem>
              <SelectItem value="news">News Trade</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setEmotion} value={emotion}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Emotion at Entry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confident">Confident</SelectItem>
              <SelectItem value="fearful">Fearful</SelectItem>
              <SelectItem value="greedy">Greedy</SelectItem>
              <SelectItem value="tired">Tired</SelectItem>
              <SelectItem value="revenge">Revenge</SelectItem>
              <SelectItem value="fomo">FOMO</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setMarketCondition} value={marketCondition}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Market Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="ranging">Ranging</SelectItem>
              <SelectItem value="volatile">Volatile</SelectItem>
              <SelectItem value="low_volume">Low Volume</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setTimeframe} value={timeframe}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="30m">30m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Confidence Level (1-10)"
            className="w-full"
            type="number"
            min={1}
            max={10}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
          <div className="col-span-2">
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add confluence tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {confluenceTags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center bg-gray-700 text-white px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-red-400"
                    onClick={() => removeTag(tag)}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {loading ? (
            <Button disabled className="cursor-none col-span-2 w-full">
              <Spinner data-icon="inline-start" />
            </Button>
          ) : (
            <Button
              className="cursor-pointer col-span-2 w-full"
              onClick={handleSubmit}
            >
              <FilePlusCorner />
              Add Trade
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Custom Setup</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Type your setup"
            value={customSetup}
            onChange={(e) => setCustomSetup(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleSaveSetup}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle className="text-center">Trade Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="mb-4" onClick={fetchTrades}>
            Refresh Trades
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Setup</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Trade Type</TableHead>
                <TableHead>Emotion</TableHead>
                <TableHead>Confluence</TableHead>
                <TableHead>ROI %</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade, i) => (
                <TableRow key={i}>
                  <TableCell>{trade.date}</TableCell>
                  <TableCell>{trade.asset}</TableCell>
                  <TableCell>{trade.setup}</TableCell>
                  <TableCell>{trade.entry}</TableCell>
                  <TableCell>{trade.exit}</TableCell>
                  <TableCell
                    className={
                      trade.trade_type === "long"
                        ? "text-teal-400"
                        : "text-red-500"
                    }
                  >
                    {trade.trade_type}
                  </TableCell>
                  <TableCell>{trade.emotion}</TableCell>
                  <TableCell>
                    {Array.isArray(trade.confluence)
                      ? trade.confluence.join(", ")
                      : trade.confluence}
                  </TableCell>
                  <TableCell>
                    {trade.roi !== null && trade.roi !== undefined
                      ? `${Number(trade.roi).toFixed(2)}%`
                      : ""}
                  </TableCell>
                  <TableCell>{trade.result}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
    </section>
  );
}
