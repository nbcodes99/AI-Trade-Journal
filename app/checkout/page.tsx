"use client";

import { useState } from "react";
import { useAuth } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import {
  CheckCircle2,
  Shield,
  Zap,
  ArrowLeft,
  Lock,
  TrendingUp,
  Brain,
  BarChart2,
  Target,
  Infinity,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";

const PRO_FEATURES = [
  { icon: Infinity, label: "Unlimited trade logging" },
  { icon: BarChart2, label: "Full analytics dashboard" },
  { icon: Brain, label: "AI Coach weekly reports" },
  { icon: Target, label: "Advanced risk manager" },
  { icon: Zap, label: "Broker integrations (IBKR, TD, Webull)" },
  { icon: Shield, label: "Priority support" },
  { icon: CheckCircle2, label: "CSV & PDF export" },
];

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: 11.99,
    period: "/month",
    badge: null,
    description: "Billed monthly, cancel anytime",
    amountKobo: 1199 * 100,
  },
  {
    id: "yearly",
    label: "Yearly",
    price: 7.99,
    period: "/month",
    badge: "Save 33%",
    description: "Billed annually — $95.88/year",
    amountKobo: 9588 * 100,
  },
];

export default function UpgradePage() {
  const { session } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [loading, setLoading] = useState(false);

  const userEmail = session?.user?.email || "";
  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    userEmail.split("@")[0] ||
    "Trader";

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  const handlePaystack = () => {
    if (!userEmail) {
      toast.error("Please sign in to continue.");
      return;
    }

    setLoading(true);

    // @ts-ignore — Paystack inline JS
    const handler = window.PaystackPop?.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: plan.amountKobo,
      currency: "USD",
      ref: `glint_${selectedPlan}_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: "Name", variable_name: "name", value: userName },
          { display_name: "Plan", variable_name: "plan", value: selectedPlan },
          {
            display_name: "User ID",
            variable_name: "user_id",
            value: session?.user?.id,
          },
        ],
      },
      callback: (response: any) => {
        setLoading(false);
        if (response.status === "success") {
          toast.success("Payment successful! Welcome to Pro 🎉");
          window.location.href = "/dashboard?upgraded=true";
        } else {
          toast.error("Payment was not completed.");
        }
      },
      onClose: () => {
        setLoading(false);
        toast("Payment cancelled.");
      },
    });

    handler?.openIframe();
  };

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js" async />

      <section className="min-h-screen bg-background">
        <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary hidden md:block" />
              <span className="font-bold text-foreground hidden md:block">
                Glint
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Secured by Paystack
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Badge variant="default" className="mb-3 text-xs">
                  Upgrading to Pro
                </Badge>
                <h1 className="text-2xl font-extrabold text-foreground leading-tight">
                  Trade smarter with every feature unlocked.
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Everything you need to go from reactive to systematic —
                  unlimited, forever.
                </p>
              </div>

              <div className="space-y-2.5">
                {PRO_FEATURES.map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                {[
                  { icon: Shield, text: "256-bit SSL encryption" },
                  { icon: CheckCircle2, text: "14-day money back guarantee" },
                  { icon: Zap, text: "Cancel anytime, no questions" },
                ].map((t) => (
                  <div key={t.text} className="flex items-center gap-2.5">
                    <t.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Choose Your Plan
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-3">
                      {PLANS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlan(p.id)}
                          className={`relative flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-150 ${
                            selectedPlan === p.id
                              ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                              : "border-border hover:border-primary/40 bg-card"
                          }`}
                        >
                          {p.badge && (
                            <span className="absolute -top-2.5 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                              {p.badge}
                            </span>
                          )}
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                selectedPlan === p.id
                                  ? "border-primary"
                                  : "border-border"
                              }`}
                            >
                              {selectedPlan === p.id && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="text-sm font-bold text-foreground">
                              {p.label}
                            </span>
                          </div>
                          <div className="pl-6">
                            <span className="text-xl font-extrabold text-foreground">
                              ${p.price}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {p.period}
                            </span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {p.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Account
                    </p>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-extrabold border border-primary/20 shrink-0">
                        {userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {userEmail}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        Free
                      </Badge>
                    </div>
                    {!session && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-amber-500">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          You need to{" "}
                          <Link href="/login" className="underline">
                            sign in
                          </Link>{" "}
                          before upgrading.
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Order Summary
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Glint Pro — {plan.label}
                        </span>
                        <span className="font-semibold text-foreground">
                          $
                          {selectedPlan === "yearly"
                            ? "95.88"
                            : `${plan.price}/mo`}
                        </span>
                      </div>
                      {selectedPlan === "yearly" && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-primary text-xs">
                            Annual discount (33% off)
                          </span>
                          <span className="text-primary text-xs font-semibold">
                            −$47.88
                          </span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">
                          Total today
                        </span>
                        <span className="text-xl font-extrabold text-foreground">
                          $
                          {selectedPlan === "yearly"
                            ? "95.88"
                            : plan.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedPlan === "yearly"
                          ? "Billed once per year. Next charge in 12 months."
                          : "Billed every month. Cancel anytime before renewal."}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 font-bold text-base gap-2"
                    onClick={handlePaystack}
                    disabled={loading || !session}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening payment...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        Pay $
                        {selectedPlan === "yearly"
                          ? "95.88"
                          : plan.price.toFixed(2)}{" "}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
                    <Lock className="h-3 w-3" />
                    <span>
                      Payments are secured and processed by Paystack. We never
                      store your card details.
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-xs text-muted-foreground">
                  Powered by
                </span>
                <span className="text-xs font-bold text-foreground">
                  Paystack
                </span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  <Shield className="h-2.5 w-2.5" /> PCI DSS Compliant
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
