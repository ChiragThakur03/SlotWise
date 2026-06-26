"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/settings/profile-tab";
import { BookingPageTab } from "@/components/settings/booking-page-tab";
import { PaymentsTab } from "@/components/settings/payments-tab";
import { BillingTab } from "@/components/settings/billing-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { TeamTab } from "@/components/settings/team-tab";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-medium text-navy">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="booking-page">Booking page</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="booking-page">
          <BookingPageTab />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab />
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="team">
          <TeamTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
