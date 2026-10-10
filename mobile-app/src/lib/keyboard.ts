// Tells a screen where the on-screen keyboard starts, so the page can lift out of its way.
import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// The keyboard's top edge in screen coordinates, or null while it is closed.
export function useKeyboardTop(): number | null {
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => setTop(event.endCoordinates.screenY));
    const hide = Keyboard.addListener(hideEvent, () => setTop(null));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return top;
}
