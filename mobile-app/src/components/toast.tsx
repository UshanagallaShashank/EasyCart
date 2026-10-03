// Short messages at the bottom of the screen ("Order placed", "Wrong code. 4 tries left.").
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text } from './text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '@/theme/theme';

type Kind = 'success' | 'error' | 'info';
const ToastContext = createContext<(message: string, kind?: Kind) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; kind: Kind } | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, kind: Kind = 'info') => {
    clearTimeout(timer.current);
    setToast({ message, kind });
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
    }, 2800);
  }, [opacity]);

  const background = toast?.kind === 'error' ? colors.danger : toast?.kind === 'success' ? colors.success : colors.text;
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <Animated.View pointerEvents="none" style={[styles.toast, { opacity, bottom: insets.bottom + 84, backgroundColor: background }]}>
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', left: 16, right: 16, maxWidth: 520, alignSelf: 'center', borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 16 },
  text: { color: colors.white, fontSize: 14, fontWeight: '500', textAlign: 'center' }
});
