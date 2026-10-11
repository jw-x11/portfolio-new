import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "../lib/gsap";

export function ToTop() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  return (
    <button
      className={`to-top${visible ? " is-visible" : ""}`}
      type="button"
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        gsap.to(window, {
          duration: reduced ? 0 : 0.8,
          ease: "power3.inOut",
          scrollTo: { y: 0 },
        });
      }}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
      </svg>
    </button>
  );
}
