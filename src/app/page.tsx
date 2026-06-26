import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-off-white p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-btn bg-teal" />
          <span className="text-2xl font-semibold text-navy">SlotWise</span>
        </div>
        <p className="max-w-sm text-muted-foreground">
          Booking &amp; scheduling for tattoo artists, groomers, music teachers,
          stylists, and more.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="primary" asChild>
          <Link href="/signup">Get started</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Badge variant="confirmed">Confirmed</Badge>
        <Badge variant="pending">Pending</Badge>
        <Badge variant="cancelled">Cancelled</Badge>
        <Badge variant="completed">Completed</Badge>
      </div>
    </main>
  );
}
