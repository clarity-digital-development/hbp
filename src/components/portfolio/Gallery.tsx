"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Slide } from "@/lib/galleries";

// The grid sits in a max-w-[47.5rem] px-7 column: 760 - 56 = 704px of content,
// so each of the two columns is (704 - 30) / 2 = 337px. Quoting 760/365 here
// would make the browser fetch a derivative wider than anything ever rendered.
const WIDE_SIZES = "(max-width: 47.5rem) calc(100vw - 3.5rem), 704px";
const TALL_SIZES = "(max-width: 47.5rem) calc(50vw - 1.75rem), 337px";

/**
 * Two-up grid where landscape frames span the full width, plus a lightbox.
 * Arrow keys step, Escape closes, Tab is trapped inside the dialog, and focus
 * returns to the tile that opened it.
 */
export function Gallery({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const isOpen = index !== null;

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = (i: number, el: HTMLElement) => {
    openerRef.current = el;
    setIndex(i);
  };

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + slides.length) % slides.length)),
    [slides.length]
  );

  useEffect(() => {
    if (!isOpen) {
      // Hand focus back to the tile that opened the viewer.
      openerRef.current?.focus();
      openerRef.current = null;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowRight") return step(1);
      if (e.key === "ArrowLeft") return step(-1);
      if (e.key !== "Tab") return;

      // Keep Tab inside the dialog rather than letting it walk the page behind.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, step]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-x-[30px] sm:gap-y-[34px] items-start">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={(e) => open(i, e.currentTarget)}
            aria-label={`Open ${s.alt} (${i + 1} of ${slides.length})`}
            className={`group relative block w-full overflow-hidden border-2 border-olive bg-mist transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_26px_rgba(117,122,59,0.20)] ${
              s.wide ? "col-span-2 aspect-[3/2]" : "aspect-[2/3]"
            }`}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              quality={82}
              /* The first row is above the fold on every viewport. */
              priority={i < 2}
              className="object-cover"
              sizes={s.wide ? WIDE_SIZES : TALL_SIZES}
            />
          </button>
        ))}
      </div>

      {isOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgb(38_42_28_/_0.92)] px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${index + 1} of ${slides.length}: ${slides[index].alt}`}
          onClick={close}
        >
          <button
            ref={closeRef}
            onClick={close}
            aria-label="Close viewer"
            className="absolute top-4 right-4 z-10 p-2 text-off-white/85 hover:text-off-white transition-colors"
          >
            <X size={26} strokeWidth={1.25} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Previous image"
            /* z-10 matters: without it these paint under the photo, which is
               wider than the gutter at most viewports, and become dead zones. */
            className="absolute left-1 sm:left-3 z-10 p-2 text-off-white/85 hover:text-off-white transition-colors drop-shadow-[0_1px_3px_rgb(0_0_0_/_0.6)]"
          >
            <ChevronLeft size={30} strokeWidth={1.25} />
          </button>

          <div
            className="relative flex max-h-full max-w-[min(1000px,84vw)] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={slides[index].src}
              alt={slides[index].alt}
              width={1200}
              height={1800}
              quality={86}
              sizes="(max-width: 1200px) 84vw, 1000px"
              className="h-auto max-h-[80vh] w-auto max-w-full border-2 border-olive object-contain"
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Next image"
            className="absolute right-1 sm:right-3 z-10 p-2 text-off-white/85 hover:text-off-white transition-colors drop-shadow-[0_1px_3px_rgb(0_0_0_/_0.6)]"
          >
            <ChevronRight size={30} strokeWidth={1.25} />
          </button>

          <p className="absolute bottom-3 left-0 right-0 z-10 text-center text-xs uppercase tracking-[0.22em] text-off-white/75">
            {index + 1} / {slides.length}
          </p>
        </div>
      )}
    </>
  );
}
