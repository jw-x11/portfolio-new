import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useLocation, type Location } from "react-router-dom";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { lockScroll } from "../lib/scrollLock";

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
/** Hold the cover at least this long after the swap, and never longer than the cap. */
const SETTLE_MS = 200;
/** The photo page is light, so going there settles sooner and slides faster. */
const GALLERY_SETTLE_MS = 60;
const GALLERY_SPEED = 0.75;
const READY_CAP_MS = 3500;

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Resolves once the new page's images and fonts are ready and it has painted. */
function pageReady(shell: HTMLElement | null, settle: number) {
  const images = shell ? [...shell.querySelectorAll("img")] : [];
  const loads = images.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {})));
  const ready = Promise.all([...loads, document.fonts?.ready]).then(async () => {
    await frame();
    await frame();
    await new Promise((resolve) => setTimeout(resolve, settle));
  });
  return Promise.race([ready, new Promise((resolve) => setTimeout(resolve, READY_CAP_MS))]);
}

function slideDuration(from: number, to: number) {
  return Math.max(0.22, (Math.abs(to - from) / 100) * SLIDE);
}

export function PageTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
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

    const lock = () => {
      const unlock = lockScroll();
      unlockRef.current = () => {
        unlock();
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
    if (!unlockRef.current) lock();

    const from = xPercentOf(overlay);
    let cancelled = false;
    const timeline = gsap.timeline({ overwrite: true });

    if (Math.abs(from) >= 1) {
      timeline.to(overlay, {
        xPercent: 0,
        duration: slideDuration(from, 0) * (toGallery ? GALLERY_SPEED : 1),
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
    // Keep the page covered until everything on it has loaded.
    timeline.add(() => {
      timeline.pause();
      void pageReady(shellRef.current, toGallery ? GALLERY_SETTLE_MS : SETTLE_MS).then(() => {
        if (cancelled) return;
        ScrollTrigger.refresh();
        timeline.play();
      });
    });
    timeline.to(overlay, { xPercent: leaveTo, duration: SLIDE * (toGallery ? GALLERY_SPEED : 1), ease: "power3.inOut" });
    timeline.add(release);

    return () => {
      cancelled = true;
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
      <div className="page-shell" ref={shellRef}>{children(shown)}</div>
    </>
  );
}
