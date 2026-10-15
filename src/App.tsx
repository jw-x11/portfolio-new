import { useLayoutEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Cursor } from "./components/Cursor";
import { Footer } from "./components/Footer";
import { Intro } from "./components/Intro";
import { Nav } from "./components/Nav";
import { ScrollRuler } from "./components/ScrollRuler";
import { PageTransition } from "./components/PageTransition";
import { ToTop } from "./components/ToTop";
import { gsap, registerGsap } from "./lib/gsap";
import { initSmoothScroll } from "./lib/smoothScroll";
import { Gallery } from "./pages/Gallery";
import { Home } from "./pages/Home";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");

  useLayoutEffect(() => {
    registerGsap();
    const stopSmooth = initSmoothScroll();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return stopSmooth;

    const tween = gsap.to(".progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.2,
      },
    });

    return () => {
      stopSmooth();
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <>
      <div className="site-bg" aria-hidden="true">
        <div className="site-bg-wash" />
        <div className="site-bg-frost" />
        <div className="site-bg-dots" />
      </div>
      <div className="progress" aria-hidden="true" />
      <Cursor />
      <Intro />
      <Nav activeSection={activeSection} />
      <ScrollRuler activeSection={activeSection} />
      <ToTop />
      <PageTransition>
        {(frozen) => (
          <>
            <Routes location={frozen}>
              <Route path="/" element={<Home onSection={setActiveSection} />} />
              <Route path="/gallery" element={<Gallery />} />
            </Routes>
            <Footer />
          </>
        )}
      </PageTransition>
    </>
  );
}
