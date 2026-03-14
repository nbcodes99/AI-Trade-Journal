"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Signup successful! Check your email for confirmation.");
    }

    setLoading(false);
  };

  return (
    <section className="pt-36 w-full flex flex-col items-center px-10">
      <h1 className="text-3xl font-bold text-center">Sign Up</h1>
      <p className="text-center text-zinc-400 text-sm my-3">
        If you have an account, login{" "}
        <a href="/login" className="underline text-indigo-500">
          now
        </a>
      </p>

      <form className="w-full max-w-md mt-10" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
            <Input
              id="fieldgroup-name"
              placeholder="Jake"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
            <Input
              id="fieldgroup-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
            <Input
              id="fieldgroup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && (
            <FieldDescription className="text-red-500">
              {error}
            </FieldDescription>
          )}
          <Field orientation="horizontal">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Submit"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </section>
  );
}
