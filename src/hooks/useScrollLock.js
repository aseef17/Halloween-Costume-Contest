import { useEffect } from "react";

/**
 * Custom hook to manage body scroll lock
 * @param {boolean} isLocked - Whether to lock the scroll
 */
export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // Store the current scroll position
      const scrollY = window.scrollY;

      // Lock the scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scroll position and unlock
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
};

export default useScrollLock;
