"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const session = useAuth();
  const userId = session?.user?.id ?? null;

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, avatar_path")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error.message);
      }

      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || null);
        setAvatarPath(data.avatar_path || null);
      } else {
        setFullName(session?.user?.user_metadata?.full_name || "");
        setAvatarUrl(session?.user?.user_metadata?.avatar_url || null);
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [userId, session]);

  useEffect(() => {
    if (!avatarPath) return;

    let mounted = true;
    const getSigned = async () => {
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(avatarPath, 60);
      if (error) {
        console.warn("Could not create signed URL:", error.message);
        return;
      }
      if (mounted) setAvatarUrl(data?.signedUrl || null);
    };

    getSigned();
    return () => {
      mounted = false;
    };
  }, [avatarPath]);

  if (!session) return <p>Please log in</p>;

  async function handleSave() {
    if (!userId || !session) return;
    setSaving(true);

    try {
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: session.user.email,
          full_name: fullName || null,
        },
        { onConflict: "id" },
      );

      if (upsertError) {
        console.error("Error saving profile:", upsertError.message);
        throw upsertError;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName || null },
      });

      if (authError) {
        console.warn("Warning updating auth metadata:", authError.message);
      }

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

  const displaySrc = avatarUrl || "/avatar.jpg";

  return (
    <div className="flex flex-col items-center p-12 space-y-6">
      <div className="relative">
        <Image
          src={displaySrc}
          alt="Profile"
          width={160}
          height={160}
          className="rounded-full border-4 border-teal-500 object-cover"
        />
      </div>

      {!editing ? (
        <>
          <h1 className="text-2xl font-bold">
            {fullName ||
              session.user.user_metadata?.full_name ||
              session.user.email}
          </h1>
          <p className="text-gray-500">{session.user.email}</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            <Button onClick={handleLogout} variant="destructive">
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
