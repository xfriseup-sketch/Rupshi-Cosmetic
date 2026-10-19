import { lookupPublicOrder } from "@/lib/trackOrder";
import TrackOrderClient from "@/components/TrackOrderClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Track Order | Rupshi Cosmetics",
  description: "Check your Rupshi Cosmetics order status with your order ID or phone number.",
};

export default async function TrackOrderPage({ searchParams }) {
  const id = typeof searchParams?.id === "string" ? searchParams.id : "";
  const phone = typeof searchParams?.phone === "string" ? searchParams.phone : "";

  let order = null;
  let error = "";

  if (id || phone) {
    try {
      const result = await lookupPublicOrder({ id, phone });
      if (result.error) error = result.error;
      else order = result.order;
    } catch {
      error = "Could not look up this order. Please try again.";
    }
  }

  return (
    <main className="min-h-screen bg-[#fdf8f9]">
      <TrackOrderClient
        initialId={id}
        initialPhone={phone}
        order={order}
        error={error}
      />
    </main>
  );
}
