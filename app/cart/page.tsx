import { CartView } from "../components/CartView";

export const metadata = {
  title: "Cart · SR Foods",
  description: "Your basket of Andhra heat.",
};

export default function CartPage() {
  return (
    <>
      <section className="bg-cream py-16 md:py-20">
        <CartView />
      </section>
    </>
  );
}
