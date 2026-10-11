import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LiquidGlass } from "@ybouane/liquidglass";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "../content/site";
import { gsap } from "../lib/gsap";

const homeLinks = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
] as const;

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
        chromAberration: 0.1,
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
      LiquidGlass.init({ root, glassElements: [glass] })
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
        })
        .catch((error: unknown) => {
          if (cancelled || current !== token) return;
          glass.classList.remove("is-resizing");
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
    const recaptureTheme = () => {
      const instance = glassRef.current;
      if (!instance) return;
      for (const child of instance.root.children) {
        if (!(child instanceof HTMLElement) || instance.glassSet.has(child)) continue;
        void instance.capture.captureElement(child, true);
      }
    };

    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", onResize);
    const themeObserver = new MutationObserver(recaptureTheme);
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
      window.removeEventListener("scroll", refresh);
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
