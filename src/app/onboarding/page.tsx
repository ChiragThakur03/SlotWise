"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepBusiness, type BusinessDraft } from "@/components/onboarding/step-business";
import { StepServices, type DraftService } from "@/components/onboarding/step-services";
import { StepAvailability, type DraftHours } from "@/components/onboarding/step-availability";
import { StepPayment } from "@/components/onboarding/step-payment";
import { PROFESSIONS } from "@/lib/verticals";
import type { Profession } from "@/lib/types";

const STEP_LABELS = ["Business", "Services", "Availability", "Payments"];

function buildDefaultServices(profession: Profession): DraftService[] {
  return PROFESSIONS[profession].defaultServices.map((s, i) => ({
    id: `seed-${i}`,
    name: s.name,
    durationMinutes: s.durationMinutes,
    priceDollars: String(s.priceCents / 100),
    depositRequired: s.depositRequired,
    depositDollars: s.depositRequired ? String(Math.round((s.priceCents * s.depositPercent) / 100) / 100) : "0",
  }));
}

function buildDefaultHours(): DraftHours[] {
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    isOpen: weekday !== 0,
    startTime: "09:00",
    endTime: "17:00",
  }));
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWizard />
    </Suspense>
  );
}

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profession = (searchParams.get("profession") as Profession) ?? "tattoo_artist";
  const professionConfig = PROFESSIONS[profession] ?? PROFESSIONS.tattoo_artist;

  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState<BusinessDraft>({ businessName: "", bio: "" });
  const [services, setServices] = useState<DraftService[]>(() => buildDefaultServices(profession));
  const [hours, setHours] = useState<DraftHours[]>(buildDefaultHours);
  const [depositPercent, setDepositPercent] = useState(professionConfig.defaultServices[0]?.depositPercent ?? 30);
  const [stripeConnected] = useState(false);

  const canContinue = step !== 1 || business.businessName.trim().length > 0;

  function finish() {
    router.push("/dashboard?onboarded=1");
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-7 w-7 rounded-btn bg-teal" />
          <span className="text-[15px] font-medium text-navy">SlotWise</span>
        </div>

        <div className="mb-2 flex gap-1.5">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i + 1 <= step ? "bg-teal" : "bg-muted"}`} />
          ))}
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Step {step} of 4 — {STEP_LABELS[step - 1]}
        </p>

        <div className="rounded-card border-[0.5px] border-card-border bg-white p-5 sm:p-7">
          {step === 1 && <StepBusiness draft={business} onChange={(patch) => setBusiness((b) => ({ ...b, ...patch }))} />}
          {step === 2 && <StepServices services={services} onChange={setServices} />}
          {step === 3 && <StepAvailability hours={hours} onChange={setHours} />}
          {step === 4 && (
            <StepPayment depositPercent={depositPercent} onDepositPercentChange={setDepositPercent} connected={stripeConnected} />
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
                Continue
              </Button>
            ) : (
              <Button onClick={finish}>Finish setup</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
