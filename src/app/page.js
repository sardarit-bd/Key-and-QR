import Collection from "@/components/home/Collection";
import Cta from "@/components/home/Cta";
import Hero from "@/components/home/Hero";
import HowItWorksSection from "@/components/home/HowItWorks";
import Howwork from "@/components/home/testimonials";

export default function page() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <Collection />
      <Howwork />
      {/* <Testimonial /> */}
      <Cta />
    </>
  );
}
