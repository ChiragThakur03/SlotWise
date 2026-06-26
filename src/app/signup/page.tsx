"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { PROFESSION_LIST } from "@/lib/verticals";
import { PROFESSION_ICONS } from "@/lib/profession-icons";
import type { Profession } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState<Profession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() && password.length >= 6 && profession;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !profession) return;
    setError(null);

    if (!isSupabaseConfigured()) {
      router.push(`/onboarding?profession=${profession}`);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("429")) {
        setError("Too many sign-up attempts. Please wait a few minutes and try again.");
      } else if (msg.includes("already registered") || msg.includes("already been registered")) {
        setError("An account with this email already exists. Try logging in instead.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (data.user) {
      // Best-effort — succeeds once the user has an active session (depends
      // on whether email confirmation is required on the Supabase project).
      await supabase.from("profiles").insert({
        id: data.user.id,
        username: email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "") || `pro${Date.now()}`,
        profession,
      });
    }

    router.push(`/onboarding?profession=${profession}`);
  }

  return (
    <AuthShell title="Create your account" description="Set up your booking page in about 10 minutes." maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input className="mt-1.5" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              className="mt-1.5"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div>
          <Label>Pick your profession</Label>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROFESSION_LIST.map((p) => {
              const Icon = PROFESSION_ICONS[p.icon];
              const selected = profession === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProfession(p.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-card border-[0.5px] p-4 text-left transition-colors",
                    selected ? "border-teal bg-teal-light/40" : "border-card-border hover:border-teal/50"
                  )}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal">
                      <Check className="h-3 w-3 text-navy" strokeWidth={3} />
                    </span>
                  )}
                  <Icon className="h-6 w-6 text-teal-mid" />
                  <div>
                    <p className="text-sm font-medium text-navy">{p.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.tagline}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={!canSubmit || loading}>
          {loading ? "Creating account…" : profession ? `Get started as a ${PROFESSION_LIST.find((p) => p.id === profession)?.label}` : "Pick a profession to continue"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-mid hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
