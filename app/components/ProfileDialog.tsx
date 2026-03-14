"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const session = useAuth();
  const [name, setName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(
        session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          "",
      );
      setAvatarUrl(session.user.user_metadata?.avatar_url || "");
    }
  }, [session]);

  const updateProfile = async () => {
    if (!session?.user) return;
    const updates: any = { data: {} };
    if (name) updates.data.full_name = name;
    if (avatarUrl) updates.data.avatar_url = avatarUrl;

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      console.error("Failed to update profile", error.message);
    } else {
    }
    onOpenChange(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !session?.user)
      return;
    setUploading(true);
    const file = e.target.files[0];
    const filePath = `${session.user.id}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error", uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={updateProfile}>Save</Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
