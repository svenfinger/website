import { useEffect, useId, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/button";

type Slide = {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width: number;
  height: number;
};

export function WorkCarousel({
  slides,
  label,
}: {
  slides: Slide[];
  label: string;
}) {
  const [active, setActive] = useState(0);
  const row = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    scroll: number;
    index: number;
    distance: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const activeSlide = useRef(0);
  const mouseScrollTarget = useRef<number | null>(null);
  const rowId = useId();

  function slideOffset(index: number) {
    const element = row.current;
    if (!element) return 0;
    const first = element.children[0] as HTMLElement;
    const slide = element.children[index] as HTMLElement;
    return slide.offsetLeft - first.offsetLeft;
  }

  function nearestSlide() {
    const element = row.current;
    if (!element) return 0;
    let nearest = 0;
    for (let index = 1; index < slides.length; index++) {
      if (
        Math.abs(slideOffset(index) - element.scrollLeft) <
        Math.abs(slideOffset(nearest) - element.scrollLeft)
      )
        nearest = index;
    }
    return nearest;
  }

  function goTo(index: number) {
    const element = row.current;
    if (!element) return;
    const target = Math.max(0, Math.min(slides.length - 1, index));
    const left = slideOffset(target);
    if (element.hasAttribute("data-mouse-scrolling"))
      mouseScrollTarget.current = left;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element.scrollTo({
      left,
      behavior: reduceMotion ? "instant" : "smooth",
    });
    restoreSnapWhenSettled();
  }

  function restoreSnapWhenSettled() {
    const element = row.current;
    if (
      element &&
      !drag.current &&
      mouseScrollTarget.current !== null &&
      Math.abs(element.scrollLeft - mouseScrollTarget.current) < 1
    ) {
      // Restoring snap during the animation can pull the row back to the old slide.
      delete element.dataset.mouseScrolling;
      mouseScrollTarget.current = null;
    }
  }

  useEffect(() => {
    const element = row.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      // Preserve the current slide when the viewport changes orientation or size.
      const first = element.children[0] as HTMLElement;
      const slide = element.children[activeSlide.current] as HTMLElement;
      if (first && slide && !drag.current)
        element.scrollTo({
          left: slide.offsetLeft - first.offsetLeft,
          behavior: "instant",
        });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    let target = nearestSlide();
    if (
      current.moved &&
      event.type === "pointerup" &&
      Math.abs(current.distance) >= 24
    ) {
      // A short deliberate drag advances one slide; longer drags may go farther.
      target =
        current.distance < 0
          ? Math.max(current.index + 1, target)
          : Math.min(current.index - 1, target);
    }
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (current.moved) goTo(target);
    else delete event.currentTarget.dataset.mouseScrolling;
  }

  return (
    <section
      className="work-carousel"
      aria-label={label}
      aria-roledescription="carousel"
    >
      <div
        id={rowId}
        ref={row}
        className="work-carousel-row"
        onScroll={() => {
          activeSlide.current = nearestSlide();
          setActive(activeSlide.current);
          restoreSnapWhenSettled();
        }}
        onScrollEnd={(event) => {
          if (!drag.current) {
            delete event.currentTarget.dataset.mouseScrolling;
            mouseScrollTarget.current = null;
          }
        }}
        onKeyDown={(event) => {
          const target =
            event.key === "ArrowLeft"
              ? active - 1
              : event.key === "ArrowRight"
                ? active + 1
                : event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? slides.length - 1
                    : null;
          if (target !== null) {
            event.preventDefault();
            goTo(target);
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          suppressClick.current = false;
          const element = event.currentTarget;
          element.dataset.mouseScrolling = "";
          mouseScrollTarget.current = null;
          // Stop an in-flight animation before the pointer takes control.
          element.scrollTo({ left: element.scrollLeft, behavior: "instant" });
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            scroll: event.currentTarget.scrollLeft,
            index: nearestSlide(),
            distance: 0,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.id !== event.pointerId) return;
          const distance = event.clientX - current.x;
          if (!current.moved && Math.abs(distance) < 6) return;
          if (!current.moved) {
            event.currentTarget.dataset.dragging = "";
            event.currentTarget.setPointerCapture(event.pointerId);
            current.moved = true;
          }
          current.distance = distance;
          suppressClick.current = true;
          event.currentTarget.scrollLeft = current.scroll - distance;
        }}
        onPointerUp={finishDrag}
        onPointerLeave={(event) => {
          if (drag.current && !drag.current.moved) finishDrag(event);
        }}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        {slides.map((slide, index) => (
          <Button
            key={`${slide.src}-${index}`}
            className="work-carousel-slide"
            aria-label={`Show image ${index + 1} of ${slides.length}: ${slide.alt}`}
            aria-current={active === index ? "true" : undefined}
            onClick={() => goTo(index)}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible")) goTo(index);
            }}
          >
            <img
              src={slide.src}
              srcSet={slide.srcSet}
              sizes={slide.sizes}
              alt={slide.alt}
              width={slide.width}
              height={slide.height}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </Button>
        ))}
      </div>
      <div className="work-block work-block--prose work-carousel-controls">
        <Button
          size="icon"
          className="work-carousel-arrow"
          aria-label="Previous image"
          aria-controls={rowId}
          disabled={active === 0}
          onClick={() => goTo(active - 1)}
        >
          <ChevronLeftIcon className="size-6" aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          className="work-carousel-arrow"
          aria-label="Next image"
          aria-controls={rowId}
          disabled={active === slides.length - 1}
          onClick={() => goTo(active + 1)}
        >
          <ChevronRightIcon className="size-6" aria-hidden="true" />
        </Button>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Image {active + 1} of {slides.length}
        </p>
      </div>
    </section>
  );
}
