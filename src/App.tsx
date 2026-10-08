import { useLayoutEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Cursor } from "./components/Cursor";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";
import { PageTransition } from "./components/PageTransition";
import { gsap, registerGsap, ScrollTrigger } from "./lib/gsap";
import { Gallery } from "./pages/Gallery";
import { Home } from "./pages/Home";

const sectionIds = ["about", "work", "contact", "social"];

export default function App() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("about");

  useLayoutEffect(() => {
    registerGsap();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.to(".progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.2,
          },
        });
      }

      if (location.pathname === "/") {
        sectionIds.forEach((id) => {
          ScrollTrigger.create({
            trigger: `#${id}`,
            start: "top 45%",
            end: "bottom 45%",
            onToggle: (self) => {
              if (self.isActive) setActiveSection(id);
            },
          });
        });

        if (location.hash) {
          const id = location.hash.slice(1);
          requestAnimationFrame(() => {
            gsap.to(window, {
              duration: reduced ? 0 : 0.9,
              ease: "power3.inOut",
              scrollTo: { y: `#${id}`, offsetY: 72 },
            });
          });
        }
      }
    });

    return () => ctx.revert();
  }, [location.pathname, location.hash]);

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <Cursor />
      <Nav activeSection={activeSection} />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
        <Footer />
      </PageTransition>
    </>
  );
}
