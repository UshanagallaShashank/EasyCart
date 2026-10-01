// Rounds a chart's top value up to a clean axis number (1, 2, 2.5 or 5 times a power of ten).
const NICE_STEPS = [1, 2, 2.5, 5, 10];

export function get_nice_max(value: number): number {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = NICE_STEPS.find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}
