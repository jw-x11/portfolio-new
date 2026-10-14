import { useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { CharReveal } from "../components/CharReveal";
import { site } from "../content/site";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { onIntroReveal } from "../lib/intro";

const sectionIds = ["about", "work", "contact", "social"] as const;

type HomeProps = {
  onSection?: (id: string) => void;
};

export function Home({ onSection }: HomeProps) {
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const onSectionRef = useRef(onSection);
  onSectionRef.current = onSection;

  useLayoutEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;

    const covered = document.querySelector(".page-overlay.is-on");
    if (covered) {
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo(0, Math.max(0, top));
      ScrollTrigger.refresh();
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(window, {
      duration: reduced ? 0 : 0.9,
      ease: "power3.inOut",
      scrollTo: { y: target, offsetY: 72 },
    });
  }, [location.hash]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let stopWaiting = () => {};
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ".landing",
        start: "top 45%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (self.isActive) onSectionRef.current?.("home");
        },
      });

      sectionIds.forEach((id) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) onSectionRef.current?.(id);
          },
        });
      });

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const covered = document.querySelector(".page-overlay.is-on");
      if (reduced || covered) return;

      // Hold the hero in its final state behind the intro cover (so the glass
      // nav snapshots it), then play its entrance as the cover opens.
      stopWaiting = onIntroReveal((lead) => {
        ctx.add(() => {
          const heroChars = root.querySelectorAll(".landing .char");
          gsap.from(heroChars, {
            yPercent: 115,
            rotate: 6,
            duration: 1.15,
            stagger: 0.035,
            ease: "power4.out",
            delay: lead + 0.15,
          });

          gsap.from(".landing-eyebrow", {
            opacity: 0,
            delay: lead,
            y: 12,
            duration: 0.7,
            ease: "power2.out",
          });

          gsap.from(".hero-rule", {
            scaleX: 0,
            duration: 0.9,
            delay: lead + 0.55,
            ease: "power2.inOut",
          });

          gsap.from(".hero-meta p", {
            opacity: 0,
            x: -16,
            duration: 0.8,
            delay: lead + 0.7,
            ease: "power2.out",
          });

          gsap.from(".hero-stack li", {
            opacity: 0,
            y: 10,
            duration: 0.5,
            stagger: 0.06,
            delay: lead + 0.85,
            ease: "power2.out",
          });

          gsap.fromTo(
            ".scroll-cue-line",
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 1.1,
              delay: lead + 1,
              ease: "power2.out",
              repeat: -1,
              yoyo: true,
              repeatDelay: 0.4,
            },
          );
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            once: true,
          },
        });
      });

      gsap.from(".project", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".project-list",
          start: "top 78%",
          once: true,
        },
      });

      gsap.from(".social-list li", {
        y: 16,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".social-list",
          start: "top 85%",
          once: true,
        },
      });
    }, root);

    return () => {
      stopWaiting();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <section className="landing" aria-label="Introduction">
        <p className="landing-eyebrow">
          <span>~/dev</span> software engineer · {new Date().getFullYear()}
        </p>
        <h1 className="display-name">
          <CharReveal text={site.firstName} className="name-line" />
          <CharReveal text={site.lastName} className="name-line is-last" />
        </h1>
        <div className="hero-meta">
          <span className="hero-rule" aria-hidden="true" />
          <p>{site.tagline}</p>
        </div>
        <ul className="hero-stack">
          {site.skills.slice(0, 4).map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <a
          className="scroll-cue"
          href="#about"
          onClick={(event) => {
            event.preventDefault();
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            gsap.to(window, {
              duration: reduced ? 0 : 1,
              ease: "power3.inOut",
              scrollTo: { y: "#about", offsetY: 72 },
            });
          }}
        >
          cd about
          <span className="scroll-cue-line" aria-hidden="true" />
        </a>
      </section>

      <section className="section" id="about">
        <p className="section-index reveal">01 // about</p>
        <div className="about-grid">
          <div className="about-copy reveal">
            {site.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="reveal">
            <ul className="fact-list">
              {site.facts.map((fact) => (
                <li key={fact.label}>
                  <span>{fact.label}</span>
                  {fact.value}
                </li>
              ))}
            </ul>
            <ul className="skill-list">
              {site.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="work">
        <p className="section-index reveal">02 // work</p>
        <ul className="project-list">
          {site.projects.map((project) => (
            <li className="project" key={project.title}>
              <span className="project-year">{project.year}</span>
              <div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              {project.href ? (
                <Link className="project-link" to={project.href}>
                  View →
                </Link>
              ) : (
                <span className="project-link">Soon</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="section" id="contact">
        <p className="section-index reveal">03 // contact</p>
        <div className="contact-grid">
          <div className="reveal">
            <h2>Let’s ship something solid.</h2>
            <a className="email-link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
          <div className="contact-copy reveal">
            <p>{site.contactNote}</p>
            <p style={{ marginTop: "1rem" }}>{site.location}</p>
          </div>
        </div>
      </section>

      <section className="section social-block" id="social">
        <p className="section-index reveal">04 // social</p>
        <h2 className="reveal">Find me online</h2>
        <ul className="social-list">
          {site.social.map((item) => (
            <li key={item.name}>
              <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {item.name}
                <span>Open</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
