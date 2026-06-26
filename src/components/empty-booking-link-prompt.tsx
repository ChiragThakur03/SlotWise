"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyBookingLinkPrompt({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://slotwise.io/book/${username}`;

  function copy() {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-card border-[0.5px] border-card-border bg-white px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-light">
        <Copy className="h-5 w-5 text-accent-foreground" />
      </div>
      <div>
        <p className="font-medium text-navy">Your first booking is one share away</p>
        <p className="mt-1 text-sm text-muted-foreground">Share your booking link and clients can book themselves in.</p>
      </div>
      <div className="flex items-center gap-2 rounded-btn border border-input bg-off-white px-3 py-2 text-sm text-navy">
        {url}
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="secondary" size="icon" onClick={copy} aria-label="Copy for Instagram bio" title="Copy for Instagram bio">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          asChild
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
            <Share2 className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="secondary" size="icon" asChild aria-label="Share on X / Twitter" title="Share on X / Twitter">
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
            <Share2 className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
