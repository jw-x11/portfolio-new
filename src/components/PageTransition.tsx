import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "../lib/gsap";

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skipWipe = firstLoad.current;
    firstLoad.current = false;

    const ctx = gsap.context(() => {
      if (reduced || skipWipe) {
        gsap.set(overlay, { yPercent: -100 });
        gsap.set(content, { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline();
      tl.set(overlay, { yPercent: 0 })
        .fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0)
        .to(overlay, { yPercent: -100, duration: 0.7, ease: "power3.inOut" }, 0.05);
    });

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <>
      <div className="page-overlay" ref={overlayRef} aria-hidden="true" />
      <div className="page-shell" ref={contentRef}>
        {children}
      </div>
    </>
  );
}
