import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-off-white p-8">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-btn bg-teal" />
        <span className="text-lg font-medium text-navy">SlotWise</span>
      </div>
      <p className="text-sm text-muted-foreground">Design system smoke test</p>
      <div className="flex gap-3">
        <Button variant="primary">Get started</Button>
        <Button variant="secondary">Log in</Button>
      </div>
      <div className="flex gap-2">
        <Badge variant="confirmed">Confirmed</Badge>
        <Badge variant="pending">Pending</Badge>
        <Badge variant="cancelled">Cancelled</Badge>
        <Badge variant="completed">Completed</Badge>
      </div>
      <Card className="w-80">
        <p className="text-sm text-navy">Card surface</p>
      </Card>
      <Link href="/login" className="text-sm text-teal-mid underline">
        /login
      </Link>
    </main>
  );
}
