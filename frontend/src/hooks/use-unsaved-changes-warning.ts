// Asks the browser to confirm before closing or reloading the tab while a form has unsaved changes.
import { useEffect } from 'react';

export function useUnsavedChangesWarning(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return;
    const warn_before_unload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn_before_unload);
    return () => window.removeEventListener('beforeunload', warn_before_unload);
  }, [isDirty]);
}
