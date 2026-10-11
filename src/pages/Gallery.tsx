import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loadPhotos, type Photo } from "../lib/photos";
import { gsap } from "../lib/gsap";

export function Gallery() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPhotos().then((items) => {
      if (!cancelled) setPhotos(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (!photos?.length) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const covered = document.querySelector(".page-overlay.is-on");
      if (reduced || covered) return;

      gsap.from(".gallery-header > *", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".gallery-item", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power2.out",
        delay: 0.15,
      });
    }, root);

    return () => ctx.revert();
  }, [photos]);

  useLayoutEffect(() => {
    if (active === null || !lightboxRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, ease: "power2.out" },
      );
      gsap.fromTo(
        ".lightbox img",
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" },
      );
    }, lightboxRef);
    return () => ctx.revert();
  }, [active]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight" && photos) setActive((i) => ((i ?? 0) + 1) % photos.length);
      if (event.key === "ArrowLeft" && photos) setActive((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, photos]);

  const current = active !== null && photos ? photos[active] : null;

  return (
    <div className="gallery-page" ref={rootRef}>
      <header className="gallery-header">
        <h1>Photos</h1>
        <p>
          A hobby, kept off the main thread. Images from <code>orig-photo</code>, resized on
          build.
        </p>
      </header>

      {photos === null && <p className="gallery-empty">Loading photographs…</p>}

      {photos?.length === 0 && (
        <p className="gallery-empty">
          Add images to <code>orig-photo</code>. They appear here automatically after the resize script runs.
        </p>
      )}

      {!!photos?.length && (
        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <button
              className="gallery-item"
              type="button"
              key={photo.id}
              onClick={() => setActive(index)}
              aria-label={`Open ${photo.alt}`}
            >
              <img src={photo.thumb} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {current &&
        photos &&
        createPortal(
          <div
            className="lightbox"
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            onClick={() => setActive(null)}
          >
            <img src={current.src} alt={current.alt} onClick={(event) => event.stopPropagation()} />
            <p className="lightbox-caption">
              {current.alt} · {active! + 1} / {photos.length}
            </p>
            <div className="lightbox-ui">
              <button type="button" onClick={() => setActive(null)}>
                Close
              </button>
            </div>
            <button
              className="lightbox-nav prev"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActive((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
              }}
            >
              Prev
            </button>
            <button
              className="lightbox-nav next"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActive((i) => ((i ?? 0) + 1) % photos.length);
              }}
            >
              Next
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
