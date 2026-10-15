import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/** One tick per percent of progress; every fifth tick is long and numbered. */
const LABEL_EVERY = 5;
/** The marker travels from MARKER_TOP down to MARKER_BOTTOM (px from the viewport bottom). */
const MARKER_TOP = 112;
const MARKER_BOTTOM = 48;
/** Short pages get a stretched ruler so the ticks never squash below this spacing (px). */
const MIN_STEP = 14;

const trackLength = (max: number) => Math.max(max, MIN_STEP * 100);

type Props = { activeSection: string };

/** A ruler-style scroll indicator pinned to the right edge of the viewport. */
export function ScrollRuler({ activeSection }: Props) {
  const location = useLocation();
  const trackRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  /** Ruler length in px, which maps onto 0–100. */
  const [length, setLength] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;

    const draw = () => {
      frame = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = window.scrollY;
      const frac = Math.min(1, Math.max(0, y / max));
      const markerY = MARKER_TOP + frac * (window.innerHeight - MARKER_TOP - MARKER_BOTTOM);
      // The tick for the current progress always sits under the marker.
      track.style.transform = `translate3d(0, ${markerY - frac * trackLength(max)}px, 0)`;
      if (markerRef.current) markerRef.current.style.transform = `translate3d(0, ${markerY}px, 0)`;
      if (percentRef.current) {
        const pct = Math.min(100, Math.max(0, Math.round((y / max) * 100)));
        percentRef.current.textContent = `${String(pct).padStart(3, "0")} %`;
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const measure = () => {
      setLength(trackLength(Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));
      queue();
    };

    measure();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [location.pathname]);

  const scrubTo = (clientY: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const frac = (clientY - MARKER_TOP) / (window.innerHeight - MARKER_TOP - MARKER_BOTTOM);
    window.scrollTo(0, Math.min(1, Math.max(0, frac)) * max);
  };

  const step = length / 100;
  const section = location.pathname === "/gallery" ? "Photos" : activeSection === "work" ? "Projects" : activeSection;

  return (
    <div
      className="ruler"
      aria-hidden="true"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        scrubTo(e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) scrubTo(e.clientY);
      }}
    >
      <div className="ruler-track" ref={trackRef} style={{ height: length, "--step": `${step}px` } as React.CSSProperties}>
        {Array.from({ length: 100 / LABEL_EVERY + 1 }, (_, i) => (
          <span key={i} className="ruler-label" style={{ top: i * LABEL_EVERY * step }}>
            {i * LABEL_EVERY}
          </span>
        ))}
      </div>
      <div className="ruler-section">{section}</div>
      <div className="ruler-marker" ref={markerRef}>
        <span ref={percentRef}>000 %</span>
      </div>
    </div>
  );
}
