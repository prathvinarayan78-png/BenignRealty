import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { STORY_VIEWPORT } from "./useScrollScenes";

const chapters = [
  {
    label: "The possibility",
    title: "First, we listen.",
    text: "A quiet corner. Room for a growing family. A place for your next big idea. Your story is where our search begins.",
    image: "/images/residence-interior.webp",
    alt: "A light-filled living space opening onto a leafy terrace",
    detail: "YOUR VISION, BEFORE ANYTHING ELSE",
  },
  {
    label: "The perspective",
    title: "Then, we look closer.",
    text: "Beyond the floor plan, into the neighbourhood. We help you weigh the location, the everyday details and the questions worth asking.",
    image: "/images/villa.webp",
    alt: "A contemporary residence set within a landscaped garden",
    detail: "LOCAL KNOWLEDGE. A CLEARER PICTURE.",
  },
  {
    label: "The belonging",
    title: "A place to make yours.",
    text: "When the space and the feeling come together, the next chapter begins. A considered move, with you at the centre of it.",
    image: "/images/hero-residence.webp",
    alt: "Sculptural residential balconies against a soft Delhi-blue sky",
    detail: "NOT JUST AN ADDRESS. YOUR ADDRESS.",
  },
];

export function ScrollJourney({
  onNavigate,
}: {
  onNavigate: (target: number) => void;
}) {
  const root = useRef<HTMLElement>(null);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Short screens, touch layouts and reduced motion get a normal document flow.
    const desktop = window.matchMedia(STORY_VIEWPORT);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = root.current;
      if (!element) return;
      const enabled = desktop.matches && !reduced.matches;
      setPinned(enabled);
      const rect = element.getBoundingClientRect();
      const travel = rect.height - (window.innerHeight - 86);
      const progress =
        enabled && travel > 0
          ? Math.max(0, Math.min(1, (86 - rect.top) / travel))
          : 0;
      const measurements = Array.from(
        element.querySelectorAll<HTMLElement>(".journey-chapter"),
      ).map((chapter) => ({ chapter, rect: chapter.getBoundingClientRect() }));
      let current = Math.min(2, Math.floor(progress * 3));
      if (!enabled) {
        current = 0;
        measurements.forEach(({ rect }, index) => {
          if (rect.top <= window.innerHeight * 0.5) current = index;
        });
      }
      element.style.setProperty("--journey-progress", String(progress));
      setActive(current);
      measurements.forEach(({ chapter, rect: chapterRect }, index) => {
        const local = enabled
          ? Math.max(0, Math.min(1, progress * 3 - index))
          : reduced.matches
            ? 1
            : Math.max(
                0,
                Math.min(
                  1,
                  (window.innerHeight - chapterRect.top) /
                    (window.innerHeight + chapterRect.height),
                ),
              );
        const read = Math.max(
          0,
          Math.min(
            1,
            (window.innerHeight * 0.72 - chapterRect.top) /
              Math.max(1, chapterRect.height),
          ),
        );
        chapter.style.setProperty("--chapter-progress", String(local));
        chapter.style.setProperty("--chapter-read", String(read));
        element.style.setProperty(`--chapter-read-${index}`, String(read));
        // Incoming imagery is revealed by scroll position, not a timed crossfade.
        const wipe =
          !enabled || index === 0
            ? 1
            : Math.max(0, Math.min(1, (progress - index / 3 + 0.065) / 0.09));
        chapter.style.setProperty("--chapter-wipe", String(wipe));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    if (root.current) resize.observe(root.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    reduced.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, []);

  const navigate = (index: number) => {
    if (!root.current) return;
    if (!pinned) {
      const chapter =
        root.current.querySelectorAll<HTMLElement>(".journey-chapter")[index];
      if (!chapter) return;
      const guideHeight =
        root.current.querySelector<HTMLElement>(".journey-mobile-progress")
          ?.offsetHeight ?? 0;
      const headerHeight = window.innerWidth <= 560 ? 76 : 86;
      onNavigate(
        chapter.getBoundingClientRect().top +
          window.scrollY -
          headerHeight -
          guideHeight -
          16,
      );
      return;
    }
    const top = root.current.getBoundingClientRect().top + window.scrollY;
    const travel = root.current.offsetHeight - (window.innerHeight - 86);
    onNavigate(top - 86 + (index / 3 + 0.08) * travel);
  };

  return (
    <section
      className="scroll-journey"
      id="journey"
      ref={root}
      data-pinned={pinned}
      aria-labelledby="journey-title"
    >
      <div className="journey-stage">
        <div className="journey-intro">
          <div className="section-kicker">
            <span className="tiny-square" /> A MORE CONSIDERED JOURNEY
          </div>
          <h2 id="journey-title">
            From possibility.
            <br />
            <span>To belonging.</span>
          </h2>
          <p>
            A good move isn’t just about where you go.
            <br />
            It’s about how you get there.
          </p>
          {pinned && (
            <nav
              className="journey-navigation"
              aria-label="Property journey chapters"
            >
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.label}
                  aria-current={active === index ? "step" : undefined}
                  onClick={() => navigate(index)}
                >
                  <span className="journey-step-number">0{index + 1}</span>
                  <span>{chapter.label}</span>
                  <ArrowUpRight size={17} />
                  <span className="journey-step-track" aria-hidden="true">
                    <span
                      style={{
                        transform: `scaleX(clamp(0, calc(var(--journey-progress, 0) * 3 - ${index}), 1))`,
                      }}
                    />
                  </span>
                </button>
              ))}
            </nav>
          )}
          {pinned && (
            <div className="journey-scroll-hint">
              <ArrowDown size={14} /> SCROLL TO FOLLOW THE JOURNEY
            </div>
          )}
        </div>
        {!pinned && (
          <nav
            className="journey-mobile-progress"
            aria-label="Journey chapters"
          >
            {chapters.map((chapter, index) => (
              <button
                key={chapter.label}
                aria-current={active === index ? "step" : undefined}
                aria-controls={`journey-chapter-${index + 1}`}
                onClick={() => navigate(index)}
              >
                <span className="journey-mobile-number">0{index + 1}</span>
                <span>{chapter.label.replace("The ", "")}</span>
                <span className="journey-mobile-track" aria-hidden="true">
                  <span
                    style={{
                      transform: `scaleX(var(--chapter-read-${index}, 0))`,
                    }}
                  />
                </span>
              </button>
            ))}
          </nav>
        )}
        <div className="journey-panels">
          {chapters.map((chapter, index) => (
            <article
              className={`journey-chapter ${active === index ? "is-current" : ""}`}
              id={`journey-chapter-${index + 1}`}
              style={{ zIndex: index + 1 }}
              key={chapter.label}
              aria-hidden={pinned && active !== index ? true : undefined}
            >
              <div className="journey-image">
                <img src={chapter.image} alt={chapter.alt} loading="lazy" />
                <span className="journey-image-index" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="journey-image-detail">{chapter.detail}</span>
              </div>
              <div className="journey-chapter-copy">
                <span className="journey-chapter-label">
                  0{index + 1} / {chapter.label}
                </span>
                <h3>{chapter.title}</h3>
                <p>{chapter.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
