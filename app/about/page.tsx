import { PageBanner } from "../components/PageBanner";
import { BrandStory } from "../components/BrandStory";
import { WhyUs } from "../components/WhyUs";

export const metadata = {
  title: "About · SR Foods",
  description:
    "The story behind SR Foods — Farm to Home Andhra pickles & karam.",
};

const steps = [
  {
    n: "01",
    t: "Sourced",
    d: "Sun-ripened Guntur chillies and farm-fresh raw mangoes from trusted growers.",
  },
  {
    n: "02",
    t: "Sun-Dried",
    d: "Spread out and dried under Andhra sun until aromatic and crisp.",
  },
  {
    n: "03",
    t: "Stone-Ground",
    d: "Pounded the slow way to keep oils and fragrance intact.",
  },
  {
    n: "04",
    t: "Slow-Cured",
    d: "Pickles rest in earthen jars for weeks until the flavours marry.",
  },
  {
    n: "05",
    t: "Sealed Fresh",
    d: "Hand-packed in tamper-proof jars, sealed for the journey home.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageBanner
        eyebrow="Who We Are"
        title={
          <>
            Farm to <span className="text-turmeric">Home</span>
          </>
        }
        telugu="మన వంటకాలు · మన మూలాలు"
        subtitle="A family that grew up in Guntur's chilli fields, sharing the spices and pickles of our home with yours."
      />

      <BrandStory />

      <section className="bg-cream py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-chilli">
              Our Process
            </span>
            <h2 className="font-display mt-3 text-4xl font-black text-maroon md:text-5xl">
              Five steps. <span className="text-chilli">Zero shortcuts.</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-5">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl bg-white p-6 ring-1 ring-maroon/10 shadow-[0_10px_40px_-25px_rgba(74,10,16,0.4)]"
              >
                <div className="font-display text-3xl font-black text-chilli/30">
                  {s.n}
                </div>
                <h3 className="font-display mt-2 text-lg font-bold text-maroon">
                  {s.t}
                </h3>
                <p className="mt-2 text-sm text-charcoal/70 leading-relaxed">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyUs />
    </>
  );
}
