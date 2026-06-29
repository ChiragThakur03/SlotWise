import { notFound } from "next/navigation";
import { getPublicBookingPageData } from "@/lib/data";
import { BookingFlow } from "@/components/public-booking/booking-flow";

// Must be dynamic — shows live slot availability and fresh intake form fields
export const dynamic = "force-dynamic";

export default async function PublicBookingPage({ params }: { params: { username: string } }) {
  const data = await getPublicBookingPageData(params.username);
  if (!data) notFound();

  return (
    <BookingFlow
      profile={data.profile}
      services={data.services}
      availability={data.availability}
      dateOverrides={data.dateOverrides}
      intakeForm={data.intakeForm ?? undefined}
      bookings={data.bookings}
    />
  );
}
