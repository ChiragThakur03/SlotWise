"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useAppStore } from "@/lib/store/app-store";
import { computeClientStats } from "@/lib/derive";
import { formatCents, formatDate } from "@/lib/format";

export default function ClientsPage() {
  const store = useAppStore();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return store.clients
      .map((c) => ({ client: c, stats: computeClientStats(c.id, store.bookings) }))
      .sort((a, b) => a.client.name.localeCompare(b.client.name))
      .filter(({ client }) => !search || client.name.toLowerCase().includes(search.toLowerCase()));
  }, [store.clients, store.bookings, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-medium text-navy">Clients</h1>
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search clients" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Total sessions</TableHead>
            <TableHead>Total spent</TableHead>
            <TableHead>Last visit</TableHead>
            <TableHead>No-shows</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No clients found.
              </TableCell>
            </TableRow>
          )}
          {rows.map(({ client, stats }, index) => (
            <TableRow key={client.id} className="cursor-pointer" onClick={() => router.push(`/clients/${client.id}`)}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar name={client.name} size="sm" />
                  <span className="font-medium">{client.name}</span>
                  {stats.isReturning && <Badge variant="confirmed">Returning</Badge>}
                </div>
              </TableCell>
              <TableCell>{stats.totalSessions}</TableCell>
              <TableCell>{formatCents(stats.totalSpentCents)}</TableCell>
              <TableCell>{stats.lastVisitAt ? formatDate(stats.lastVisitAt) : "—"}</TableCell>
              <TableCell>
                {client.noShowCount > 0 ? (
                  <span className="text-destructive">{client.noShowCount}</span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
