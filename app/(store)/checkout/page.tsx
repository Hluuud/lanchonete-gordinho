import type { Metadata } from "next";

import { CheckoutPage } from "@/features/checkout/components/checkout-page";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout",
  path: "/checkout",
  index: false,
});

export default function Page() {
  return <CheckoutPage />;
}
