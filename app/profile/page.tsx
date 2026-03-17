"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ModeToggle } from "../components/ModeToggle";
import Link from "next/link";

export default function ProfilePage() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error.message);
      }

      if (data) {
        setFullName(data.full_name || "");
      } else {
        setFullName(session?.user?.user_metadata?.full_name || "");
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [userId, session]);

  if (!session)
    return (
      <p>
        You're not logged in. <Link href="/login">Log in</Link>
      </p>
    );

  async function handleSave() {
    if (!userId || !session) return;
    setSaving(true);

    try {
      setErrorMessage(null);

      const email = session.user.email;
      if (!email) {
        setErrorMessage("User email is missing.");
        setSaving(false);
        return;
      }

      if (newPassword) {
        if (!currentPassword) {
          setErrorMessage("Current password is required to change password.");
          return;
        }

        if (newPassword !== confirmPassword) {
          setErrorMessage("New password and confirmation do not match.");
          return;
        }

        const { error: authCheckError } =
          await supabase.auth.signInWithPassword({
            email,
            password: currentPassword,
          });

        if (authCheckError) {
          setErrorMessage("Current password is incorrect.");
          return;
        }
      }

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          full_name: fullName || null,
        },
        { onConflict: "id" },
      );

      if (upsertError) {
        console.error("Error saving profile:", upsertError.message);
        throw upsertError;
      }

      const authUpdate: any = { data: { full_name: fullName || null } };
      if (newPassword) {
        authUpdate.password = newPassword;
      }

      const { error: authError } = await supabase.auth.updateUser(authUpdate);

      if (authError) {
        console.warn("Warning updating auth metadata:", authError.message);
      }

      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setShowPassword(false);
      setEditing(false);
      setTimeout(() => window.location.reload(), 250);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="flex flex-col items-center p-12 space-y-4">
      <div className="w-full flex justify-end md:hidden">
        <ModeToggle />
      </div>

      {!editing ? (
        <>
          <h1 className="text-2xl font-bold">
            {loadingProfile ? (
              <Skeleton className="h-8 w-44" />
            ) : (
              fullName ||
              session.user.user_metadata?.full_name ||
              session.user.email
            )}
          </h1>
          <p className="text-gray-500">
            {loadingProfile ? (
              <Skeleton className="h-4 w-44" />
            ) : (
              session.user.email
            )}
          </p>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => setEditing(true)} className="cursor-pointer">
              Edit Profile
            </Button>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="cursor-pointer"
            >
              Logout
            </Button>
          </div>
        </>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <Input
            placeholder="Edit Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Current Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              New Password
            </label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 text-sm"
              >
                {showPassword ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
          </div>

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving || loadingProfile}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={() => setEditing(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
