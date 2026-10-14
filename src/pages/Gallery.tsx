import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loadPhotos, type Photo } from "../lib/photos";
import { gsap } from "../lib/gsap";
import { onIntroReveal } from "../lib/intro";

export function Gallery() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [outgoing, setOutgoing] = useState<Photo | null>(null);

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

    let stopWaiting = () => {};
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const covered = document.querySelector(".page-overlay.is-on");
      if (reduced || covered) return;

      stopWaiting = onIntroReveal((lead) => {
        ctx.add(() => {
          gsap.from(".gallery-header > *", {
            y: 24,
            opacity: 0,
            delay: lead,
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
            delay: lead + 0.15,
          });
        });
      });
    }, root);

    return () => {
      stopWaiting();
      ctx.revert();
    };
  }, [photos]);

  useLayoutEffect(() => {
    const shell = lightboxRef.current;
    if (active === null || !shell) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.fromTo(shell, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power2.out" });
  }, [active === null]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!outgoing || !stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [leaving, entering] = stage.querySelectorAll("img");
    if (!leaving || !entering) return;
    if (reduced) {
      setOutgoing(null);
      return;
    }

    const shift = 28 * direction.current;
    gsap.set(leaving, { opacity: 1, x: 0 });
    gsap.set(entering, { opacity: 0, x: shift });
    const tween = gsap.timeline({
      onComplete: () => setOutgoing(null),
    });
    tween.to(leaving, { opacity: 0, x: -shift, duration: 0.28, ease: "power2.inOut" }, 0);
    tween.to(entering, { opacity: 1, x: 0, duration: 0.28, ease: "power2.inOut" }, 0);
    return () => {
      tween.kill();
    };
  }, [outgoing]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight" && photos && active !== null) showPhoto((active + 1) % photos.length);
      if (event.key === "ArrowLeft" && photos && active !== null) showPhoto((active - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, photos]);

  const current = active !== null && photos ? photos[active] : null;

  const showPhoto = (index: number) => {
    if (!photos || active === null) {
      setActive(index);
      return;
    }
    const forward = (index - active + photos.length) % photos.length;
    const backward = (active - index + photos.length) % photos.length;
    direction.current = forward <= backward ? 1 : -1;
    setOutgoing(photos[active]);
    setActive(index);
  };

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
              onClick={() => showPhoto(index)}
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
            <div className="lightbox-stage" ref={stageRef} onClick={(event) => event.stopPropagation()}>
              {outgoing && <img src={outgoing.src} alt="" />}
              <img src={current.src} alt={current.alt} />
            </div>
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
                showPhoto((active! - 1 + photos.length) % photos.length);
              }}
            >
              Prev
            </button>
            <button
              className="lightbox-nav next"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPhoto((active! + 1) % photos.length);
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
