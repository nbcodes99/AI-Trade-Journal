"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Trash2,
  Save,
  LogOut,
  TrendingUp,
  Award,
  Target,
  BarChart2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Camera,
} from "lucide-react";

export default function ProfilePage() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [fullName, setFullName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    wins: number;
    losses: number;
    totalRoi: number;
  } | null>(null);

  const userEmail = session?.user?.email || "";
  const userInitials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase();
  const createdAt = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoadingProfile(true);
      const [profileRes, tradesRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", userId).single(),
        supabase.from("trades").select("result, roi").eq("user_id", userId),
      ]);

      if (profileRes.data) {
        setFullName(
          profileRes.data.full_name ||
            session?.user?.user_metadata?.full_name ||
            "",
        );
      } else {
        setFullName(session?.user?.user_metadata?.full_name || "");
      }

      if (tradesRes.data) {
        const trades = tradesRes.data;
        const wins = trades.filter((t) => t.result === "win").length;
        const losses = trades.filter((t) => t.result === "loss").length;
        const totalRoi = trades.reduce((a, t) => {
          const r = typeof t.roi === "string" ? parseFloat(t.roi) : t.roi;
          return a + (isNaN(r) ? 0 : r);
        }, 0);
        setStats({ total: trades.length, wins, losses, totalRoi });
      }

      setLoadingProfile(false);
    };
    load();
  }, [userId]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground text-sm">You're not logged in.</p>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    try {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          { id: userId, email: userEmail, full_name: fullName || null },
          { onConflict: "id" },
        );
      if (upsertError) throw upsertError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName || null },
      });
      if (authError) console.warn(authError.message);

      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile.");
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error: authCheckError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (authCheckError) {
        toast.error("Current password is incorrect.");
        setSavingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password.");
    }
    setSavingPassword(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const winRate =
    stats && stats.total > 0
      ? ((stats.wins / stats.total) * 100).toFixed(1)
      : "0.0";

  return (
    <section className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Account Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your profile and preferences
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Hero Card */}
        <Card className="border-border overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 border-4 border-background text-primary text-2xl font-extrabold shadow-lg">
                  {loadingProfile ? (
                    <Skeleton className="h-full w-full rounded-2xl" />
                  ) : (
                    userInitials
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-1 pb-1">
                {loadingProfile ? (
                  <>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-52 mt-1" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-extrabold text-foreground">
                        {fullName || userEmail.split("@")[0]}
                      </h2>
                      <Badge variant="default" className="text-[10px] h-5 py-0">
                        Pro
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                    {createdAt && (
                      <p className="text-xs text-muted-foreground/60">
                        Member since {createdAt}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Trading stats strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Trades",
                  value: stats?.total ?? 0,
                  icon: BarChart2,
                  color: "text-foreground",
                },
                {
                  label: "Win Rate",
                  value: `${winRate}%`,
                  icon: Target,
                  color:
                    parseFloat(winRate) >= 50
                      ? "text-primary"
                      : "text-destructive",
                },
                {
                  label: "Total ROI",
                  value: `${(stats?.totalRoi ?? 0) >= 0 ? "+" : ""}${(stats?.totalRoi ?? 0).toFixed(1)}%`,
                  icon: TrendingUp,
                  color:
                    (stats?.totalRoi ?? 0) >= 0
                      ? "text-primary"
                      : "text-destructive",
                },
                {
                  label: "Best Streak",
                  value: `${stats?.wins ?? 0}W`,
                  icon: Award,
                  color: "text-amber-500",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-muted/40 border border-border p-3"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className={`h-3 w-3 ${s.color}`} />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                  {loadingProfile ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <p className={`text-lg font-extrabold ${s.color}`}>
                      {s.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">
                    Personal Information
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Update your display name
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={userEmail}
                    disabled
                    className="pl-9 h-11 bg-muted/40 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Button
                className="w-full h-10 gap-2 font-semibold"
                onClick={handleSaveProfile}
                disabled={savingProfile || loadingProfile}
              >
                {savingProfile ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">
                    Change Password
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Keep your account secure
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-9 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  New Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
                {confirmPassword && newPassword && (
                  <div
                    className={`flex items-center gap-1.5 text-xs ${
                      confirmPassword === newPassword
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {confirmPassword === newPassword ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" /> Passwords do not
                        match
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                className="w-full h-10 gap-2 font-semibold"
                onClick={handleChangePassword}
                disabled={
                  savingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {savingPassword ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Changing...
                  </span>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-destructive">
                  Danger Zone
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Irreversible account actions
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Delete Account
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete your account and all trade data. This
                  cannot be undone.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive hover:text-foreground gap-2 shrink-0"
                onClick={() =>
                  toast.error(
                    "Please contact support@glint.app to delete your account.",
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
