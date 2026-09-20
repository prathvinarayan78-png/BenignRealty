import { useEffect } from "react";

export const STORY_VIEWPORT =
  "(min-width: 901px) and (min-height: 700px) and (hover: hover) and (pointer: fine)";
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Reversible, frame-batched animation values; no React renders per scroll frame. */
export function useScrollScenes() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia(STORY_VIEWPORT);
    const hero = document.querySelector<HTMLElement>(".hero-scroll");
    const heroImage = document.querySelector<HTMLImageElement>(".hero-image");
    const stage = document.querySelector<HTMLElement>(".hero");
    const progress = document.querySelector<HTMLElement>(".reading-progress");
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      const pinned = desktop.matches && !reduced.matches;
      if (hero && hero.dataset.pinned !== String(pinned))
        hero.dataset.pinned = String(pinned);
      // Re-query: filtering the collection can add and remove cards after mount.
      const measurements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scroll-scene]"),
      ).map((element) => ({ element, rect: element.getBoundingClientRect() }));
      const heroRect = hero?.getBoundingClientRect();
      const stageHeight = stage?.offsetHeight ?? height;
      const range = document.documentElement.scrollHeight - height;
      progress?.style.setProperty(
        "--page-progress",
        String(range > 0 ? clamp(window.scrollY / range) : 0),
      );
      for (const { element, rect } of measurements) {
        const scene = clamp((height - rect.top) / (height + rect.height));
        const reveal = clamp(
          (height * 0.85 - rect.top) / Math.min(rect.height, height * 0.65),
        );
        element.style.setProperty(
          "--scene-progress",
          String(reduced.matches ? 0.5 : scene),
        );
        element.style.setProperty(
          "--reveal-progress",
          String(reduced.matches ? 1 : reveal),
        );
      }
      const heroProgress =
        pinned && heroRect
          ? clamp(-heroRect.top / Math.max(1, heroRect.height - stageHeight))
          : 0;
      hero?.style.setProperty("--hero-progress", String(heroProgress));
      const mobileProgress =
        !pinned && !reduced.matches && heroRect
          ? clamp(-heroRect.top / stageHeight)
          : 0;
      hero?.style.setProperty("--mobile-hero-progress", String(mobileProgress));
      if (heroImage) {
        const travel = pinned
          ? heroProgress * 24
          : Math.min(window.scrollY, stageHeight) * 0.085;
        heroImage.style.transform = reduced.matches
          ? "none"
          : `translate3d(0, ${travel}px, 0) scale(${1.035 + heroProgress * 0.13 + mobileProgress * 0.045})`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    desktop.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, []);
}
