import { CheckoutForm } from "../components/CheckoutForm";

export const metadata = {
  title: "Checkout · SR Foods",
  description: "Complete your SR Foods order — secure payment via PhonePe.",
};

export default function CheckoutPage() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <CheckoutForm />
    </section>
  );
}
