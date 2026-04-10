import { useEffect } from "react";

/**
 * Hook that registers a beforeunload listener to warn users of unsaved changes.
 * Prevents accidental data loss when navigating away or closing the tab.
 *
 * @param shouldBlock - When true, shows browser warning before tab close/refresh/navigation
 * @param message - The message displayed in the confirmation dialog
 *
 * @example
 * const [isDirty, setIsDirty] = useState(false);
 * useNavigationGuard(isDirty, "You have unsaved changes. Are you sure you want to leave?");
 */
function useNavigationGuard(
  shouldBlock: boolean,
  message: string = "You have unsaved changes. Are you sure you want to leave?",
): void {
  useEffect(() => {
    if (!shouldBlock) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlock, message]);
}

export { useNavigationGuard };
export default useNavigationGuard;
