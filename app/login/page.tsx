"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert("Logged in!");
  };

  const handleForgot = async () => {
    if (!email) {
      alert("Please enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) alert(error.message);
    else alert("Password reset email sent");
  };

  return (
    <>
      <section className="pt-36 w-full flex flex-col items-center px-10">
        <h1 className="text-3xl font-bold text-center">Login Now</h1>
        <p className="text-center text-zinc-400 text-sm my-3">
          Don't have an account, sign up{" "}
          <a href="/signup" className="underline text-indigo-500">
            here
          </a>
        </p>
        <form className="w-full max-w-md mt-10">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
              <Input
                id="fieldgroup-email"
                type="email"
                placeholder="name@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
              <Input
                id="fieldgroup-password"
                type="password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field orientation="horizontal">
              <Button type="button" onClick={handleLogin}>
                Submit
              </Button>
              <button
                type="button"
                className="ml-4 text-sm text-indigo-500 underline"
                onClick={handleForgot}
              >
                Forgot password?
              </button>
            </Field>
          </FieldGroup>
        </form>
      </section>
    </>
  );
}
