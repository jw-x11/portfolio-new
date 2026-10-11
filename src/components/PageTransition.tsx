import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useLocation, type Location } from "react-router-dom";
import { gsap, ScrollTrigger } from "../lib/gsap";

const scrollKeys = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

function labelFor(pathname: string) {
  return pathname.startsWith("/gallery") ? "Photos" : "Home";
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function xPercentOf(overlay: HTMLDivElement) {
  const value = Number(gsap.getProperty(overlay, "xPercent"));
  return Number.isFinite(value) ? value : 100;
}

function parkOverlay(overlay: HTMLDivElement) {
  overlay.classList.remove("is-on");
  gsap.set(overlay, { xPercent: 100 });
}

const SLIDE = 0.43;

function slideDuration(from: number, to: number) {
  return Math.max(0.22, (Math.abs(to - from) / 100) * SLIDE);
}

export function PageTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(location);
  const [label, setLabel] = useState(() => labelFor(location.pathname));
  const shownPath = useRef(location.pathname);
  const locationRef = useRef(location);
  const unlockRef = useRef<(() => void) | null>(null);
  locationRef.current = location;

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const next = locationRef.current;

    const lockScroll = () => {
      const blockWheel = (event: Event) => event.preventDefault();
      const blockKeys = (event: KeyboardEvent) => {
        if (scrollKeys.has(event.key)) event.preventDefault();
      };
      window.addEventListener("wheel", blockWheel, { passive: false });
      window.addEventListener("touchmove", blockWheel, { passive: false });
      window.addEventListener("keydown", blockKeys);
      unlockRef.current = () => {
        window.removeEventListener("wheel", blockWheel);
        window.removeEventListener("touchmove", blockWheel);
        window.removeEventListener("keydown", blockKeys);
        unlockRef.current = null;
      };
    };

    const release = () => {
      unlockRef.current?.();
      parkOverlay(overlay);
    };

    if (next.pathname === shownPath.current) {
      if (!overlay.classList.contains("is-on")) return;

      setLabel(labelFor(shownPath.current));
      const x = xPercentOf(overlay);
      if (Math.abs(Math.abs(x) - 100) < 2) {
        release();
        return;
      }

      const dest = x >= 0 ? 100 : -100;
      const tween = gsap.to(overlay, {
        xPercent: dest,
        duration: slideDuration(x, dest),
        ease: "power3.inOut",
        overwrite: true,
        onComplete: release,
      });
      return () => tween.kill();
    }

    const toGallery = next.pathname.startsWith("/gallery");
    const enterFrom = toGallery ? 100 : -100;
    const leaveTo = toGallery ? -100 : 100;

    if (prefersReducedMotion()) {
      flushSync(() => {
        shownPath.current = next.pathname;
        setShown(next);
      });
      if (!next.hash) window.scrollTo(0, 0);
      release();
      ScrollTrigger.refresh();
      return;
    }

    setLabel(labelFor(next.pathname));
    const x = xPercentOf(overlay);
    const parked = !overlay.classList.contains("is-on") || Math.abs(Math.abs(x) - 100) < 2;
    if (parked) gsap.set(overlay, { xPercent: enterFrom });
    overlay.classList.add("is-on");
    if (!unlockRef.current) lockScroll();

    const from = xPercentOf(overlay);
    const timeline = gsap.timeline({ overwrite: true });

    if (Math.abs(from) >= 1) {
      timeline.to(overlay, {
        xPercent: 0,
        duration: slideDuration(from, 0),
        ease: "power3.inOut",
      });
    }

    timeline.add(() => {
      flushSync(() => {
        shownPath.current = next.pathname;
        setShown(next);
      });
      if (!next.hash) window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    });
    timeline.to(overlay, { xPercent: leaveTo, duration: SLIDE, ease: "power3.inOut" }, "+=0.04");
    timeline.add(release);

    return () => {
      timeline.kill();
    };
  }, [location.pathname]);

  return (
    <>
      <div className="page-overlay" ref={overlayRef} aria-hidden="true">
        <div className="page-overlay-mark">
          <span className="page-overlay-kicker">~/</span>
          <span className="page-overlay-label">{label}</span>
        </div>
      </div>
      <div className="page-shell">{children(shown)}</div>
    </>
  );
}
