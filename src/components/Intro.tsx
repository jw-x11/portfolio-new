import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "../content/site";
import { gsap } from "../lib/gsap";
import { beginIntro, revealIntro, whenGlassReady } from "../lib/intro";

const scrollKeys = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

/** The cover stays at least this long, even when the glass is ready sooner. */
const MIN_HOLD = 500;
/** Give up waiting for the glass after this long. */
const MAX_HOLD = 4000;
/** Let the glass settle its first frames before animating. */
const SETTLE = 150;
const SPLIT = 0.75;

export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    beginIntro();

    // Block scrolling with listeners rather than overflow: hidden. Hiding the
    // scrollbar changes the page width, which makes the liquid glass re-snapshot
    // the page after its capture pass, while the hero is still GSAP-hidden.
    const blockScroll = (event: Event) => event.preventDefault();
    const blockKeys = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key)) event.preventDefault();
    };
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockKeys);
    const unlock = () => {
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeys);
    };

    const ctx = gsap.context(() => {}, root);
    let opened = false;
    let held = false;
    let glassDone = false;
    let settleTimer = 0;

    // The glass snapshot blocks the main thread, so the cover stays still
    // while it runs and only animates once the thread is free again.
    const open = () => {
      if (opened) return;
      opened = true;
      ctx.add(() => {
        gsap
          .timeline({
            onComplete: () => {
              unlock();
              setDone(true);
            },
          })
          .to(".intro-panel.top", { yPercent: -100, duration: SPLIT, ease: "power3.inOut" })
          .to(".intro-panel.bottom", { yPercent: 100, duration: SPLIT, ease: "power3.inOut" }, "<")
          // Fire while the cover is still shut, so entrance animations hide
          // their targets before any of the page shows.
          .call(revealIntro, [SPLIT * 0.3], 0);
      });
    };
    const maybeOpen = () => {
      if (!held || !glassDone) return;
      settleTimer = window.setTimeout(open, SETTLE);
    };

    const holdTimer = window.setTimeout(() => {
      held = true;
      maybeOpen();
    }, MIN_HOLD);
    const maxTimer = window.setTimeout(open, MAX_HOLD);
    const stopWaiting = whenGlassReady(() => {
      glassDone = true;
      maybeOpen();
    });

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(maxTimer);
      window.clearTimeout(settleTimer);
      stopWaiting();
      ctx.revert();
      unlock();
    };
  }, []);

  if (done) return null;

  // Portalled outside #root so the liquid glass nav snapshots the page, not the cover.
  return createPortal(
    <div className="intro" ref={rootRef} aria-hidden="true">
      <div className="intro-panel top">
        <div className="intro-mark">
          <span className="page-overlay-kicker">~/</span>
          <span className="page-overlay-label">
            {site.firstName} {site.lastName}
          </span>
        </div>
        <span className="intro-edge" />
      </div>
      <div className="intro-panel bottom">
        <span className="intro-edge" />
      </div>
    </div>,
    document.body,
  );
}
