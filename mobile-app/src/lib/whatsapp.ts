// Opens WhatsApp with a ready message, to one number or to pick a chat. If WhatsApp is not on the phone,
// the phone's normal share sheet opens instead, so the message can still be sent another way.
import { Linking, Share } from 'react-native';

// Finds the 10-digit phone written as "Ph: 9876543210" in an order's address line.
export function phoneFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  const at = address.lastIndexOf('Ph: ');
  if (at === -1) return null;
  let digits = '';
  for (const character of address.slice(at + 'Ph: '.length)) {
    if (character >= '0' && character <= '9') digits += character;
    else break;
  }
  return digits.length === 10 ? digits : null;
}

export async function openWhatsApp(message: string, phone?: string | null) {
  const text = encodeURIComponent(message);
  // Indian mobile numbers: country code 91 before the 10 digits.
  const app = phone ? `whatsapp://send?phone=91${phone}&text=${text}` : `whatsapp://send?text=${text}`;
  try {
    await Linking.openURL(app);
    return;
  } catch {
    // WhatsApp is not installed (or this is the web): try the WhatsApp website, then the share sheet.
  }
  if (phone) {
    try {
      await Linking.openURL(`https://wa.me/91${phone}?text=${text}`);
      return;
    } catch {
      // fall through to the share sheet
    }
  }
  await Share.share({ message });
}
