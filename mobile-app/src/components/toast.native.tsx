// Short messages ("Order placed", "Wrong code. 4 tries left.") on phones, drawn by sonner-native:
// they stack, can be swiped away, and buzz on success or error. The web uses toast.tsx instead.
import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { Toaster, toast } from 'sonner-native';
import { useT } from '@/lib/i18n';
import { errorFeedback, successFeedback } from '@/lib/feedback';

type Kind = 'success' | 'error' | 'info';
const ToastContext = createContext<(message: string, kind?: Kind) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const show = useCallback((message: string, kind: Kind = 'info') => {
    const words = t(message);
    if (kind === 'success') {
      successFeedback();
      toast.success(words);
      return;
    }
    if (kind === 'error') {
      errorFeedback();
      toast.error(words);
      return;
    }
    toast(words);
  }, [t]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Toaster position="top-center" richColors duration={2800} visibleToasts={3} swipeToDismissDirection="up" />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
