// v1.0 landing - drop a LinkedIn PDF or screenshots.
// The visual chrome is Sunset Arcade:
// chunky Bowlby headlines with letter-by-letter spring-in, cherry/marigold
// hard shadows, holographic foil sweep, ambient sparkle particles.

import { UploadDropzone } from "@/components/UploadDropzone";
import { LandingFX } from "./LandingFX";
import { Hero } from "./Hero";

export default function Landing() {
  return (
    <div className="px-5 sm:px-8 relative">
      <LandingFX />

      <Hero />

      <section className="pb-10 max-w-3xl mx-auto relative z-[2]">
        <UploadDropzone />
      </section>
    </div>
  );
}
