// Gets the rider's attention when a new order is offered: a short chime, a buzz on phones,
// and "New order" in the tab title while an offer is waiting. Each offer alerts once.
import { useEffect, useRef } from 'react';
import type { RiderOrder } from '@/features/delivery/types/delivery-types';

function chime() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    // Two rising notes, like a doorbell.
    [660, 880].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.18;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.17);
    });
    window.setTimeout(() => ctx.close(), 600);
  } catch {
    // Some browsers block sound until the page has been tapped; the buzz and title still work.
  }
}

export function useOfferAlert(offers: RiderOrder[] | undefined) {
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const list = offers ?? [];
    const fresh = list.filter((offer) => !seen.current.has(offer.id));
    fresh.forEach((offer) => seen.current.add(offer.id));
    if (fresh.length > 0) {
      chime();
      navigator.vibrate?.([200, 100, 200]);
    }

    const base = document.title.replace(/^\(\d+\) New order · /, '');
    document.title = list.length > 0 ? `(${list.length}) New order · ${base}` : base;
  }, [offers]);

  // Put the normal title back when the rider leaves the app area.
  useEffect(() => () => { document.title = document.title.replace(/^\(\d+\) New order · /, ''); }, []);
}
