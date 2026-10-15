import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LiquidGlass } from "@ybouane/liquidglass";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "../content/site";
import { gsap } from "../lib/gsap";
import { markGlassReady } from "../lib/intro";

const homeLinks = [
  { id: "about", label: "About" },
  { id: "work", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

const CAPTURE_CLASS = "is-glass-capture";

type NavProps = {
  activeSection: string;
};

export function Nav({ activeSection }: NavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const glassRef = useRef<InstanceType<typeof LiquidGlass> | null>(null);
  const onHome = location.pathname === "/";

  useEffect(() => {
    const root = document.getElementById("root");
    const glass = navRef.current;
    if (!root || !glass) return;

    const writeConfig = () => {
      const radius = Math.max(24, Math.round(glass.offsetHeight / 2));
      glass.dataset.config = JSON.stringify({
        cornerRadius: radius,
        zRadius: 10,
        blurAmount: 0.1,
        refraction: 0.5,
        chromAberration: 0.15,
        edgeHighlight: 0.2,
        fresnel: 1,
        specular: 0.05,
        shadowOpacity: 0.14,
        shadowSpread: 14,
        shadowOffsetY: 8,
        tintStrength: 0.03,
        floating: false,
      });
    };

    let cancelled = false;
    let token = 0;
    let resizeTimer = 0;

    const boot = () => {
      const current = ++token;
      writeConfig();
      // Show every animated element in its final state while the library
      // takes its one-time snapshot (init awaits the capture), then hide again.
      const html = document.documentElement;
      html.classList.add(CAPTURE_CLASS);
      LiquidGlass.init({ root, glassElements: [glass] })
        .finally(() => html.classList.remove(CAPTURE_CLASS))
        .then((instance) => {
          if (cancelled || current !== token) {
            instance.destroy();
            return;
          }
          glassRef.current = instance;
          glass.classList.add("is-liquid");
          glass.classList.remove("is-resizing");
          root.style.userSelect = "";
          root.style.webkitUserSelect = "";
          markGlassReady();
        })
        .catch((error: unknown) => {
          if (cancelled || current !== token) return;
          glass.classList.remove("is-resizing");
          markGlassReady();
          console.warn("Liquid glass nav failed to start.", error);
        });
    };

    const onResize = () => {
      glass.classList.add("is-resizing");
      glass.classList.remove("is-liquid");
      token += 1;
      glassRef.current?.destroy();
      glassRef.current = null;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!cancelled) boot();
      }, 180);
    };

    const refresh = () => glassRef.current?.markChanged();
    window.addEventListener("scroll", refresh, { passive: true });
    // Images that finish loading after the snapshot (load events do not bubble, so capture).
    const onImageLoad = (event: Event) => {
      if (event.target instanceof HTMLImageElement) glassRef.current?.markChanged();
    };
    document.addEventListener("load", onImageLoad, true);
    window.addEventListener("resize", onResize);
    // A theme switch restarts the glass: same show, capture, hide pass as boot.
    const themeObserver = new MutationObserver(onResize);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const overlay = document.querySelector(".page-overlay");
    const overlayObserver = new MutationObserver(refresh);
    if (overlay) {
      overlayObserver.observe(overlay, { attributes: true, attributeFilter: ["class", "style"] });
    }

    boot();

    return () => {
      cancelled = true;
      token += 1;
      window.clearTimeout(resizeTimer);
      document.documentElement.classList.remove(CAPTURE_CLASS);
      window.removeEventListener("scroll", refresh);
      document.removeEventListener("load", onImageLoad, true);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
      overlayObserver.disconnect();
      glass.classList.remove("is-liquid");
      glassRef.current?.destroy();
      glassRef.current = null;
    };
  }, []);

  useEffect(() => {
    const refresh = window.setTimeout(() => glassRef.current?.markChanged(), 1000);
    return () => window.clearTimeout(refresh);
  }, [location.pathname]);

  const goToSection = (id: string) => {
    if (!onHome) {
      navigate(`/#${id}`);
      return;
    }
    gsap.to(window, {
      duration: 1,
      ease: "power3.inOut",
      scrollTo: { y: `#${id}`, offsetY: 72 },
    });
  };

  return (
    <header className="nav" ref={navRef}>
      <div className="nav-inner">
        <Link className="nav-mark" to="/" aria-label="Home">
          {site.firstName} <span>{site.lastName}</span>
        </Link>
        <div className="nav-end">
          <nav className="nav-links" aria-label="Primary">
            <button
              type="button"
              className={onHome && activeSection === "home" ? "is-active" : ""}
              onClick={() => {
                if (!onHome) {
                  navigate("/");
                  return;
                }
                gsap.to(window, {
                  duration: 0.8,
                  ease: "power3.inOut",
                  scrollTo: { y: 0 },
                });
              }}
            >
              Home
            </button>
            {homeLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                className={onHome && activeSection === link.id ? "is-active" : ""}
                onClick={() => goToSection(link.id)}
              >
                {link.label}
              </button>
            ))}
            <Link className={location.pathname === "/gallery" ? "is-active" : ""} to="/gallery">
              Photos
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
