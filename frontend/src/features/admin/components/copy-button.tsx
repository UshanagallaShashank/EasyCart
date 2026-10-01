// Small button that copies text to the clipboard and briefly confirms it.
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy_text() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return <Button type="button" variant="outline" size="sm" onClick={copy_text} aria-live="polite">{copied ? <Check /> : <Copy />} {copied ? 'Copied' : label}</Button>;
}
