import Collection from "@/components/home/Collection";
import Cta from "@/components/home/Cta";
import Hero from "@/components/home/Hero";
import Howwork from "@/components/home/Howwork";
import Testimonial from "@/components/home/Testimonial";
import Why from "@/components/home/Why";

export default function page() {
  return (
    <>
      <Hero />
      <Why />
      <Collection />
      <Howwork />
      <Testimonial />
      <Cta />
    </>
  )
}
