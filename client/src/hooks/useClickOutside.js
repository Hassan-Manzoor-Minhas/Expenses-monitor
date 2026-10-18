import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside a referenced container and handle Escape / resize.
 * Treats trigger and dropdown menu as one logical interactive region.
 *
 * @param {Function} handler - Function to invoke on outside click or Escape
 * @param {boolean} isOpen - Whether the dropdown/popover is currently open
 * @param {boolean} closeOnResize - Whether to close on window resize
 * @returns {React.RefObject} - Ref to attach to the dropdown wrapper element
 */
export const useClickOutside = (handler, isOpen = true, closeOnResize = true) => {
  const ref = useRef(null);
  const handlerRef = useRef(handler);

  // Keep latest handler reference without triggering effect re-subscriptions
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isOpen) return;

    // Use pointerdown so outside interaction is captured immediately without swallowing the event
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handlerRef.current(event);
      }
    };

    // Keyboard support: Escape closes the open menu
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handlerRef.current(event);
      }
    };

    // Close on window resize to prevent floating detached menus
    const handleResize = () => {
      if (closeOnResize) {
        handlerRef.current();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    if (closeOnResize) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeOnResize) {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [isOpen, closeOnResize]);

  return ref;
};

export default useClickOutside;
