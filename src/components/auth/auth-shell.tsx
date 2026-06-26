import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
  maxWidth = "max-w-sm",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-off-white px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="h-7 w-7 rounded-btn bg-teal" />
        <span className="text-[15px] font-medium text-navy">SlotWise</span>
      </Link>
      <div className={`w-full ${maxWidth} rounded-card border-[0.5px] border-card-border bg-white p-6 sm:p-8`}>
        <h1 className="text-lg font-medium text-navy">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
