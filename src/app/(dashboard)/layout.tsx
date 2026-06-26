import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { AppStoreProvider } from "@/lib/store/app-store";
import {
  getCurrentProfile,
  getServices,
  getClients,
  getBookings,
  getAvailability,
  getDateOverrides,
  getIntakeForm,
  getStaff,
  getNotificationTemplates,
  getNotificationLog,
} from "@/lib/data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [
    profile,
    services,
    clients,
    bookings,
    availability,
    dateOverrides,
    intakeForm,
    staff,
    notificationTemplates,
    notificationLog,
  ] = await Promise.all([
    getCurrentProfile(),
    getServices(),
    getClients(),
    getBookings(),
    getAvailability(),
    getDateOverrides(),
    getIntakeForm(),
    getStaff(),
    getNotificationTemplates(),
    getNotificationLog(),
  ]);

  if (!profile) redirect("/login");

  return (
    <AppStoreProvider
      initial={{
        profile,
        services,
        clients,
        bookings,
        availability,
        dateOverrides,
        intakeForm,
        staff,
        notificationTemplates,
        notificationLog,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-off-white">
        <Sidebar businessName={profile.businessName} profession={profile.profession} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar businessName={profile.businessName} username={profile.username} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-page px-4 py-6 md:px-8 md:py-8">{children}</div>
          </main>
        </div>
      </div>
    </AppStoreProvider>
  );
}
