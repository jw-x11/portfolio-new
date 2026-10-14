import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "../lib/gsap";
import { whenNextGlassCapture } from "../lib/intro";
import { lockScroll } from "../lib/scrollLock";
import { applyTheme, getTheme, type Theme } from "../lib/theme";

const CLOSE = 0.55;
const OPEN = 0.75;
/** Give up waiting for the glass after this long. */
const MAX_HOLD = 4000;
/** Let the glass settle its first frames before opening. */
const SETTLE = 150;

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  /** The theme being switched to while the curtain is up. */
  const [target, setTarget] = useState<Theme | null>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = getTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  // Close the curtain, swap the theme while the page is covered, wait for the
  // liquid glass to re-snapshot the page in its new colours, then open.
  useLayoutEffect(() => {
    const curtain = curtainRef.current;
    if (!target || !curtain) return;

    const unlock = lockScroll();
    let opened = false;
    let maxTimer = 0;
    let settleTimer = 0;
    let stopWaiting = () => {};

    const ctx = gsap.context(() => {
      gsap.set(".intro-panel.top", { yPercent: -100 });
      gsap.set(".intro-panel.bottom", { yPercent: 100 });
    }, curtain);

    const open = () => {
      if (opened) return;
      opened = true;
      stopWaiting();
      window.clearTimeout(maxTimer);
      ctx.add(() => {
        gsap
          .timeline({
            onComplete: () => {
              unlock();
              setTarget(null);
            },
          })
          .to(".intro-panel.top", { yPercent: -100, duration: OPEN, ease: "power3.inOut" })
          .to(".intro-panel.bottom", { yPercent: 100, duration: OPEN, ease: "power3.inOut" }, "<");
      });
    };

    const swap = () => {
      stopWaiting = whenNextGlassCapture(() => {
        settleTimer = window.setTimeout(open, SETTLE);
      });
      maxTimer = window.setTimeout(open, MAX_HOLD);
      applyTheme(target);
      setTheme(target);
    };

    ctx.add(() => {
      gsap.to(".intro-panel", {
        yPercent: 0,
        duration: CLOSE,
        ease: "power3.inOut",
        onComplete: swap,
      });
    });

    return () => {
      stopWaiting();
      window.clearTimeout(maxTimer);
      window.clearTimeout(settleTimer);
      ctx.revert();
      unlock();
    };
  }, [target]);

  const switchTheme = () => {
    if (target) return;
    const next = theme === "dark" ? "light" : "dark";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyTheme(next);
      setTheme(next);
      return;
    }
    setTarget(next);
  };

  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        title={theme === "dark" ? "Light" : "Dark"}
        onClick={switchTheme}
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 13.5A6.5 6.5 0 0 1 10 5a7 7 0 1 0 9.5 9.5 6.5 6.5 0 0 1-4-1Z" />
          </svg>
        )}
      </button>
      {target &&
        createPortal(
          // Portalled outside #root so the liquid glass never snapshots the curtain.
          <div className={`intro to-${target}`} ref={curtainRef} aria-hidden="true">
            <div className="intro-panel top">
              <span className="intro-edge" />
            </div>
            <div className="intro-panel bottom">
              <span className="intro-edge" />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
