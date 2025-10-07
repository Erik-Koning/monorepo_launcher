import { RefObject, useState, useLayoutEffect } from "react";

interface ScrollPosition {
  scrollX: number;
  scrollY: number;
}

// A simple throttle function to limit how often the scroll handler runs.
function throttle(callback: () => void, limit: number) {
  let waiting = false;
  return function () {
    if (!waiting) {
      callback();
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
}

// A debounce function to delay execution until after a certain time has passed without the event firing.
function debounce(callback: () => void, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  return function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback();
    }, delay);
  };
}

/**
 * A performant hook to track the scroll position of a referenced HTML element.
 *
 * @param ref - A React ref object pointing to the scrollable element.
 * @param throttleMs - The throttle delay in milliseconds to limit scroll event frequency.
 * @returns An object containing the scrollX and scrollY positions.
 */
function useScrollPosition(
  ref: RefObject<HTMLElement | null>,
  throttleMs: number | false = false,
  debounceMs: number | false = false,
  enable: boolean = true
): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    scrollX: 0,
    scrollY: 0,
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !enable) return;

    const handleScroll = () => {
      if (debounceMs) {
        debounce(() => {
          setPosition({
            scrollX: element.scrollLeft,
            scrollY: element.scrollTop,
          });
        }, debounceMs)();
      } else {
        setPosition({
          scrollX: element.scrollLeft,
          scrollY: element.scrollTop,
        });
      }
    };

    const throttledHandleScroll = throttleMs ? throttle(handleScroll, throttleMs) : handleScroll;

    // Set initial position
    handleScroll();

    element.addEventListener("scroll", throttledHandleScroll, throttleMs ? { passive: true } : undefined);

    return () => {
      element.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [ref, throttleMs, enable]);

  return position;
}

export default useScrollPosition;
