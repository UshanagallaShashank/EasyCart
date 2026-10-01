// Turns raw status values like "ready_for_pickup" into readable labels like "Ready for pickup".
export function format_status_label(value: string): string {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
