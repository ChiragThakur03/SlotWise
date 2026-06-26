export interface HorizontalBarDatum {
  label: string;
  value: number;
  meta?: string;
}

export function HorizontalBarChart({
  data,
  formatValue = (v) => String(v),
}: {
  data: HorizontalBarDatum[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium text-navy">{d.label}</span>
            <span className="text-muted-foreground">
              {formatValue(d.value)} {d.meta && <span className="ml-1 text-xs">· {d.meta}</span>}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-teal" style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
