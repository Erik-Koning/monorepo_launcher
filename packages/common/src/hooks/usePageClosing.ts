import { useEffect } from "react";

export function usePageClosing(callback: (ev: Event) => void, enable = true) {
  useEffect(() => {
    if (!enable) return;

    // The 'beforeHistoryChange' event from next/router is not available in the App Router.
    // This hook now relies on standard browser events to detect when a page is closing.
    const handleEvent = (ev: Event) => {
      // For visibilitychange, only trigger the callback when the page is hidden.
      if (ev.type === "visibilitychange" && document.visibilityState !== "hidden") {
        return;
      }
      callback(ev);
    };

    window.addEventListener("unload", handleEvent);
    window.addEventListener("pagehide", handleEvent);
    document.addEventListener("visibilitychange", handleEvent);

    return () => {
      // Unbind the event listeners on clean up
      window.removeEventListener("unload", handleEvent);
      window.removeEventListener("pagehide", handleEvent);
      document.removeEventListener("visibilitychange", handleEvent);
    };
  }, [callback, enable]);
}
