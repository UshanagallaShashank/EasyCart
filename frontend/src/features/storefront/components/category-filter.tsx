import { useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePublicCategories } from '../hooks/use-public-categories';

export function CategoryFilter({ slug }: { slug: string }) {
  const { data: categories } = usePublicCategories(slug);
  const [searchParams, setSearchParams] = useSearchParams();

  function handleChange(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('category_id');
    else next.set('category_id', value);
    setSearchParams(next);
  }

  return (
    <Select value={searchParams.get('category_id') ?? 'all'} onValueChange={handleChange}>
      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
