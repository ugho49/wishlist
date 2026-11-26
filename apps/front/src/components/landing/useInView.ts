import type { RefCallback, RefObject } from 'react';

import { useEffect, useState } from 'react';

type UseInViewOptions = {
  /** Share of the element that must be visible, 0 to 1. */
  threshold?: number;
  rootMargin?: string;
  /** Stay `true` after the first time the element is seen. */
  once?: boolean;
};

/**
 * Callback ref to pass as `ref={...}`. It also keeps the element in `current`, so a caller can
 * read it later (in a timer, an effect) like a ref object.
 */
export type InViewRef<T extends Element> = RefCallback<T> & RefObject<T | null>;

/**
 * Tells whether an element is in the viewport. Landing animations start from it, so they play
 * when the visitor reaches them. Without IntersectionObserver, the element counts as visible.
 *
 * The returned ref is a callback ref: the element is observed whenever it mounts, even after
 * the first commit, and the observer moves along if the element is replaced.
 */
export const useInView = <T extends Element>({
  threshold = 0.3,
  rootMargin = '0px',
  once = true,
}: UseInViewOptions = {}) => {
  const [element, setElement] = useState<T | null>(null);
  const [inView, setInView] = useState(false);

  // Created once, so the ref keeps the same identity for the whole life of the component.
  const [ref] = useState(() => {
    const callbackRef: InViewRef<T> = Object.assign(
      (node: T | null) => {
        callbackRef.current = node;
        setElement(node);
      },
      { current: null as T | null },
    );
    return callbackRef;
  });

  useEffect(() => {
    if (element === null) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold, rootMargin, once]);

  return [ref, inView] as const;
};

/** Whether the visitor asked for reduced motion; animated scenes then show their final state. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
