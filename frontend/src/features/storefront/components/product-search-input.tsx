import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export function ProductSearchInput() {
  const [searchParams, setSearchParams] = useSearchParams();

  function handleChange(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next);
  }

  return (
    <Input
      placeholder="Search products…"
      className="w-64"
      defaultValue={searchParams.get('search') ?? ''}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
