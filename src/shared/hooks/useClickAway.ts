import { useEffect, RefObject } from 'react';

/**
 * Custom hook to detect clicks outside of a specified element.
 * @param ref - The reference to the element.
 * @param callback - The function to execute when a click outside is detected.
 */
export const useClickAway = (
  ref: RefObject<HTMLElement | null>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};
