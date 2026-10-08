import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useLayoutEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const hover = window.matchMedia("(hover: hover)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || !hover || reduced) return;

    setOn(true);
    document.documentElement.classList.add("has-cursor");
    return () => document.documentElement.classList.remove("has-cursor");
  }, []);

  useLayoutEffect(() => {
    if (!on) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let hovering = false;
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power3.out" });

    const isTarget = (node: EventTarget | null) =>
      node instanceof Element && Boolean(node.closest("a, button, input, textarea, label, [data-cursor]"));

    const onMove = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      const next = isTarget(event.target);
      if (next === hovering) return;
      hovering = next;
      ring.classList.toggle("is-hot", next);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, [on]);

  if (!on) return null;

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div className="cursor-ring" ref={ringRef}>
        <span className="cursor-ring-core" />
      </div>
      <div className="cursor-dot" ref={dotRef} />
    </div>
  );
}
