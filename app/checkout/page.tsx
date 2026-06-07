import { CheckoutForm } from "../components/CheckoutForm";
import { PageBanner } from "../components/PageBanner";

export const metadata = {
  title: "Checkout · SR Foods",
  description: "Complete your SR Foods order — secure payment via PhonePe.",
};

export default function CheckoutPage() {
  return (
    <>
      <PageBanner
        eyebrow="Almost there"
        title={
          <>
            Secure <span className="text-turmeric">Checkout</span>
          </>
        }
        telugu="చెల్లింపు"
      />
      <section className="bg-cream py-16 md:py-20">
        <CheckoutForm />
      </section>
    </>
  );
}
