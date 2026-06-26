import { notFound } from "next/navigation";
import { getPublicBookingPageData } from "@/lib/data";
import { BookingFlow } from "@/components/public-booking/booking-flow";

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
