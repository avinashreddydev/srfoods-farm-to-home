import { AccountView } from "../components/AccountView";

export const metadata = {
  title: "My Account · SR Foods",
  description: "Your SR Foods orders, saved addresses and profile.",
};

export default function AccountPage() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <AccountView />
    </section>
  );
}
