// Our own popup for "Are you sure?" questions, in the app's look instead of the phone's plain alert.
// Use it like:  const confirm = useConfirm();  if (await confirm({ title: 'Log out?', message: '...' })) doIt();
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn as FadeInView, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Text } from './text';
import { Icon, type IconName } from './icon';
import { PressScale } from './motion';
import { useSession } from '@/lib/session';
import { useT } from '@/lib/i18n';
import { colors, radius, shadow, space, text, toneColors, type Tone } from '@/theme/theme';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // danger = red (cancel, delete, log out), primary = blue, warning = amber.
  tone?: 'danger' | 'primary' | 'warning';
  icon?: IconName;
}

type Ask = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<Ask>(() => Promise.resolve(false));

const DEFAULT_ICON: Record<NonNullable<ConfirmOptions['tone']>, IconName> = {
  danger: 'alert-triangle',
  warning: 'alert-circle',
  primary: 'info'
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const answer = useRef<((yes: boolean) => void) | null>(null);

  const ask = useCallback<Ask>((next) => {
    return new Promise<boolean>((resolve) => {
      answer.current = resolve;
      setOptions(next);
    });
  }, []);

  function close(yes: boolean) {
    answer.current?.(yes);
    answer.current = null;
    setOptions(null);
  }

  const tone = options?.tone ?? 'danger';
  const look = toneColors[tone as Tone];
  const confirmBackground = tone === 'danger' ? colors.danger : tone === 'warning' ? colors.warning : colors.primary;

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      <Modal visible={Boolean(options)} transparent animationType="none" onRequestClose={() => close(false)} statusBarTranslucent>
        {options && (
          <Animated.View entering={FadeInView.duration(120)} exiting={FadeOut.duration(100)} style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => close(false)} accessibilityLabel="Close" />
            <Animated.View entering={ZoomIn.duration(160)} style={styles.dialog}>
              <View style={[styles.iconWrap, { backgroundColor: look.bg }]}>
                <Icon name={options.icon ?? DEFAULT_ICON[tone]} size={26} color={look.fg} />
              </View>
              <Text style={styles.title}>{options.title}</Text>
              {options.message ? <Text style={styles.message}>{options.message}</Text> : null}
              <View style={styles.buttons}>
                <PressScale onPress={() => close(false)} style={[styles.button, styles.cancel]} accessibilityRole="button">
                  <Text style={styles.cancelText}>{options.cancelLabel ?? t('Not now')}</Text>
                </PressScale>
                <PressScale onPress={() => close(true)} style={[styles.button, { backgroundColor: confirmBackground }]} accessibilityRole="button">
                  <Text style={styles.confirmText}>{options.confirmLabel ?? 'Yes'}</Text>
                </PressScale>
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}

// Log out, but only after the person says yes.
export function useConfirmedSignOut() {
  const { signOut } = useSession();
  const confirm = useConfirm();
  const t = useT();
  return async () => {
    const yes = await confirm({ title: t('Log out?'), message: t('You will need to sign in again to use the app.'), confirmLabel: t('Log out'), cancelLabel: t('Stay signed in'), icon: 'log-out' });
    if (yes) await signOut();
  };
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  dialog: { width: '100%', maxWidth: 360, backgroundColor: colors.card, borderRadius: radius.xl, padding: space.xl, alignItems: 'center', gap: space.sm, ...shadow, shadowOpacity: 0.2, shadowRadius: 24 },
  iconWrap: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  title: { ...text.heading, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  message: { ...text.muted, textAlign: 'center', lineHeight: 19 },
  buttons: { flexDirection: 'row', gap: space.sm, marginTop: space.md, width: '100%' },
  button: { flex: 1, minHeight: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md },
  cancel: { backgroundColor: colors.borderSoft, borderWidth: 1, borderColor: colors.border },
  cancelText: { fontSize: 15, fontWeight: '700', color: colors.text },
  confirmText: { fontSize: 15, fontWeight: '800', color: colors.white }
});
