"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      const msg = signInError.message.toLowerCase();
      if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("wrong")) {
        setError("Incorrect email or password.");
      } else if (msg.includes("email not confirmed")) {
        setError("Please confirm your email before logging in. Check your inbox.");
      } else if (msg.includes("rate limit") || msg.includes("429")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError(signInError.message);
      }
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthShell title="Log in" description="Welcome back to your SlotWise dashboard.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            className="mt-1.5"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>Password</Label>
            <Link href="/forgot-password" className="text-xs text-teal-mid hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            className="mt-1.5"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-teal-mid hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
