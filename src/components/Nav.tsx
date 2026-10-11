import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const [scrolled, setScrolled] = useState(false);
  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
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
