export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ segments, size = 140 }: { segments: DonutSegment[]; size?: number }) {
  const total = Math.max(1, segments.reduce((s, seg) => s + seg.value, 0));
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;

  let offsetAcc = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF2F6" strokeWidth={16} />
        {segments.map((seg, i) => {
          const fraction = seg.value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const offset = offsetAcc;
          offsetAcc += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={16}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-navy">{seg.label}</span>
            <span className="text-muted-foreground">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
