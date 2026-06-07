import { CartView } from "../components/CartView";
import { PageBanner } from "../components/PageBanner";

export const metadata = {
  title: "Cart · SR Foods",
  description: "Your basket of Andhra heat.",
};

export default function CartPage() {
  return (
    <>
      <PageBanner
        eyebrow="Your Basket"
        title={
          <>
            The <span className="text-turmeric">Cart</span>
          </>
        }
        telugu="మీ బుట్ట"
      />
      <section className="bg-cream py-16 md:py-20">
        <CartView />
      </section>
    </>
  );
}
