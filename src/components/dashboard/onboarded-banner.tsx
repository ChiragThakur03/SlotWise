"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Check, Share2, X } from "lucide-react";
import { Confetti } from "@/components/confetti";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";

export function OnboardedBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useAppStore();
  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (searchParams.get("onboarded") === "1") {
      setVisible(true);
      setShowConfetti(true);
      router.replace("/dashboard");
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  if (!visible) return null;

  const url = `https://slotwise.io/book/${store.profile.username}`;

  function copy() {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="flex flex-wrap items-center gap-3 rounded-card border-[0.5px] border-teal bg-teal-light px-4 py-3">
        <p className="flex-1 text-sm font-medium text-accent-foreground">
          🎉 Your booking page is live — share it and get your first booking.
        </p>
        <Button size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <a
            href={`https://www.instagram.com/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              copy();
              window.open("https://www.instagram.com/", "_blank");
            }}
          >
            <Share2 className="h-3.5 w-3.5" /> Share on Instagram
          </a>
        </Button>
        <button onClick={() => setVisible(false)} className="text-accent-foreground/60 hover:text-accent-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
