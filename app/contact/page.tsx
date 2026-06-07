import { PageBanner } from "../components/PageBanner";

export const metadata = {
  title: "Contact · SR Foods",
  description: "Get in touch with SR Foods — Farm to Home.",
};

export default function ContactPage() {
  return (
    <>
      <PageBanner
        eyebrow="Say Hello"
        title={
          <>
            Talk to <span className="text-turmeric">us</span>
          </>
        }
        telugu="మాతో మాట్లాడండి"
        subtitle="Bulk orders, recipe questions, partnerships — we read every message."
      />
      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:px-8">
          <form className="rounded-3xl bg-white p-8 ring-1 ring-maroon/10 shadow-[0_10px_40px_-20px_rgba(74,10,16,0.4)]">
            <h2 className="font-display text-2xl font-bold text-maroon">
              Send a message
            </h2>
            <div className="mt-6 grid gap-4">
              <Field label="Your name" placeholder="Lakshmi Devi" />
              <Field label="Email" placeholder="you@email.com" type="email" />
              <Field label="Phone" placeholder="+91 ..." />
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-charcoal/60">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us what you'd like..."
                  className="mt-1 w-full rounded-xl border border-maroon/15 bg-cream/50 px-4 py-3 text-sm focus:border-chilli focus:outline-none focus:ring-2 focus:ring-chilli/30"
                />
              </div>
              <button
                type="button"
                className="btn-primary mt-2 rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wider"
              >
                Send Message →
              </button>
            </div>
          </form>

          <div className="space-y-5">
            <InfoCard
              icon="📍"
              title="Visit us"
              lines={[
                "SR Foods – Farm to Home",
                "Brodipet, Guntur",
                "Andhra Pradesh, India 522002",
              ]}
            />
            <InfoCard
              icon="📞"
              title="Call"
              lines={["+91 98765 43210", "Mon–Sat · 9am to 7pm"]}
            />
            <InfoCard
              icon="✉️"
              title="Email"
              lines={["hello@srfoods.in", "orders@srfoods.in"]}
            />
            <div className="rounded-3xl bg-maroon p-8 text-cream">
              <h3 className="font-display text-xl font-bold text-turmeric">
                Bulk &amp; Wholesale
              </h3>
              <p className="mt-2 text-sm text-cream/80">
                Restaurants, gift hampers, wedding favours — we take pride in
                custom batches. Write to us with your requirement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-charcoal/60">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-maroon/15 bg-cream/50 px-4 py-3 text-sm focus:border-chilli focus:outline-none focus:ring-2 focus:ring-chilli/30"
      />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  lines,
}: {
  icon: string;
  title: string;
  lines: string[];
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white p-6 ring-1 ring-maroon/10">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="font-display text-lg font-bold text-maroon">
          {title}
        </div>
        {lines.map((l) => (
          <div key={l} className="text-sm text-charcoal/70">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
