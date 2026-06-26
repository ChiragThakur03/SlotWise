import {
  LayoutDashboard,
  Calendar,
  ListChecks,
  Users,
  Package,
  Clock,
  FileText,
  Bell,
  BarChart3,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/bookings", label: "Bookings", icon: ListChecks },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/services", label: "Services", icon: Package },
  { href: "/availability", label: "Availability", icon: Clock },
  { href: "/intake-forms", label: "Intake Forms", icon: FileText },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];
