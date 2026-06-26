"use client";

import * as React from "react";
import {
  actionSaveProfile,
  actionCreateService,
  actionUpdateService,
  actionCreateClient,
  actionUpdateClient,
  actionCreateBooking,
  actionUpdateBooking,
  actionSetBookingStatus,
  actionSaveAvailability,
  actionCreateDateOverride,
  actionDeleteDateOverride,
  actionSaveIntakeFormFields,
  actionCreateStaff,
  actionDeleteStaff,
  actionSaveNotificationTemplate,
  actionLogNotifications,
} from "@/lib/actions";
import type {
  AvailabilityRule,
  Booking,
  BookingStatus,
  Client,
  DateOverride,
  IntakeForm,
  IntakeFormField,
  NotificationLogEntry,
  NotificationTemplate,
  NotificationType,
  Profile,
  Service,
  Staff,
} from "@/lib/types";

interface AppState {
  profile: Profile;
  services: Service[];
  clients: Client[];
  bookings: Booking[];
  availability: AvailabilityRule[];
  dateOverrides: DateOverride[];
  intakeForm: IntakeForm;
  staff: Staff[];
  notificationTemplates: NotificationTemplate[];
  notificationLog: NotificationLogEntry[];
}

interface AppActions {
  // Sync (optimistic) — fire-and-forget DB write
  updateProfile: (patch: Partial<Profile>) => void;
  updateService: (serviceId: string, patch: Partial<Service>) => void;
  updateClient: (clientId: string, patch: Partial<Client>) => void;
  updateBooking: (bookingId: string, patch: Partial<Booking>) => void;
  setBookingStatus: (bookingId: string, status: BookingStatus) => void;
  setAvailability: (rules: AvailabilityRule[]) => void;
  removeDateOverride: (id: string) => void;
  setIntakeFormFields: (fields: IntakeFormField[]) => void;
  removeStaff: (id: string) => void;
  updateNotificationTemplate: (id: string, patch: Partial<NotificationTemplate>) => void;
  logNotification: (entries: Array<Omit<NotificationLogEntry, "id" | "sentAt">>) => void;

  // Async — waits for DB, returns real object with UUID
  addService: (data: Omit<Service, "id" | "profileId">) => Promise<Service>;
  addClient: (data: { name: string; email: string | null; phone: string | null; notes: string }) => Promise<Client>;
  addBooking: (data: Omit<Booking, "id" | "profileId">) => Promise<Booking>;
  addStaff: (data: { name: string; email: string; serviceIds?: string[] }) => Promise<Staff>;
  addDateOverride: (data: Omit<DateOverride, "id" | "profileId">) => Promise<DateOverride>;
}

type AppStore = AppState & AppActions;

const AppStoreContext = React.createContext<AppStore | null>(null);

export function AppStoreProvider({
  initial,
  children,
}: {
  initial: AppState;
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<AppState>(initial);

  const actions: AppActions = React.useMemo(
    () => ({
      // ── Sync mutations ──────────────────────────────────────────────────────

      updateProfile: (patch) => {
        setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
        actionSaveProfile(patch).catch(console.error);
      },

      updateService: (id, patch) => {
        setState((s) => ({
          ...s,
          services: s.services.map((sv) => (sv.id === id ? { ...sv, ...patch } : sv)),
        }));
        actionUpdateService(id, patch).catch(console.error);
      },

      updateClient: (id, patch) => {
        setState((s) => ({
          ...s,
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
        actionUpdateClient(id, patch).catch(console.error);
      },

      updateBooking: (id, patch) => {
        setState((s) => ({
          ...s,
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        }));
        actionUpdateBooking(id, patch).catch(console.error);
      },

      setBookingStatus: (bookingId, status) => {
        setState((s) => {
          const booking = s.bookings.find((b) => b.id === bookingId);
          const bookings = s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status } : b
          );
          const clients =
            status === "no_show" && booking
              ? s.clients.map((c) =>
                  c.id === booking.clientId
                    ? { ...c, noShowCount: c.noShowCount + 1 }
                    : c
                )
              : s.clients;

          actionSetBookingStatus(bookingId, status, booking?.clientId).catch(console.error);
          return { ...s, bookings, clients };
        });
      },

      setAvailability: (rules) => {
        setState((s) => ({ ...s, availability: rules }));
        // After save, update state with real UUIDs from DB
        actionSaveAvailability(rules)
          .then((real) => setState((s) => ({ ...s, availability: real })))
          .catch(console.error);
      },

      removeDateOverride: (id) => {
        setState((s) => ({
          ...s,
          dateOverrides: s.dateOverrides.filter((o) => o.id !== id),
        }));
        actionDeleteDateOverride(id).catch(console.error);
      },

      setIntakeFormFields: (fields) => {
        setState((s) => ({ ...s, intakeForm: { ...s.intakeForm, fields } }));
        // Access current formId inside the setState closure isn't possible here,
        // so we schedule the save asynchronously reading fresh state
        setState((s) => {
          actionSaveIntakeFormFields(s.intakeForm.id, fields)
            .then(({ formId, fields: real }) =>
              setState((prev) => ({
                ...prev,
                intakeForm: { ...prev.intakeForm, id: formId, fields: real },
              }))
            )
            .catch(console.error);
          return s; // no-op, just reads state
        });
      },

      removeStaff: (id) => {
        setState((s) => ({ ...s, staff: s.staff.filter((m) => m.id !== id) }));
        actionDeleteStaff(id).catch(console.error);
      },

      updateNotificationTemplate: (id, patch) => {
        setState((s) => {
          const updated = s.notificationTemplates.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          );
          const template = updated.find((t) => t.id === id);
          if (template) actionSaveNotificationTemplate(template).catch(console.error);
          return { ...s, notificationTemplates: updated };
        });
      },

      logNotification: (entries) => {
        setState((s) => ({
          ...s,
          notificationLog: [
            ...entries.map((e) => ({
              ...e,
              id: `log-${Date.now()}`,
              sentAt: new Date().toISOString(),
            })),
            ...s.notificationLog,
          ],
        }));
        actionLogNotifications(entries).catch(console.error);
      },

      // ── Async creates — wait for real UUID before updating state ────────────

      addService: async (data) => {
        const service = await actionCreateService(data);
        setState((s) => ({ ...s, services: [...s.services, service] }));
        return service;
      },

      addClient: async (data) => {
        const client = await actionCreateClient(data);
        setState((s) => ({ ...s, clients: [client, ...s.clients] }));
        return client;
      },

      addBooking: async (data) => {
        const booking = await actionCreateBooking(data);
        setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
        return booking;
      },

      addStaff: async ({ name, email, serviceIds = [] }) => {
        const member = await actionCreateStaff({ name, email, serviceIds });
        setState((s) => ({ ...s, staff: [...s.staff, member] }));
        return member;
      },

      addDateOverride: async (data) => {
        const override = await actionCreateDateOverride(data);
        setState((s) => ({ ...s, dateOverrides: [...s.dateOverrides, override] }));
        return override;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const value = React.useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = React.useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

// generateId is no longer used for creates (real UUIDs come from DB),
// but kept for any remaining UI-only temporary IDs (e.g. break IDs in availability)
let _counter = 0;
export function generateId(prefix: string) {
  _counter += 1;
  return `${prefix}-${Date.now()}-${_counter}`;
}

export function buildNotificationType(hoursBefore: 48 | 24 | 2): NotificationType {
  return hoursBefore === 48
    ? "reminder_48h"
    : hoursBefore === 24
    ? "reminder_24h"
    : "reminder_2h";
}
