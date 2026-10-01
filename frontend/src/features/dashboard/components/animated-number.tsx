// Counts up from 0 to the given value when it first appears.
import { useEffect, useState } from 'react';
import { animate } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
}

export function AnimatedNumber({ value, decimals = 0, prefix = '' }: AnimatedNumberProps) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, { duration: 1.1, ease: 'easeOut', onUpdate: setShown });
    return () => controls.stop();
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}
      {shown.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}
