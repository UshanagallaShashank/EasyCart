// Turns a page module's named export into a lazily loaded component, so each page downloads only when opened.
import { lazy, type ComponentType } from 'react';

export function lazy_page<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M) {
  return lazy(async () => ({ default: (await load())[name] as ComponentType }));
}
