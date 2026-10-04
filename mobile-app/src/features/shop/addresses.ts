// The customer's saved delivery addresses, kept on the phone (like the website keeps them in the browser).
// One of them is "active": checkout uses it.
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '@/lib/storage';
import { useSession } from '@/lib/session';

export interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressBook {
  list: SavedAddress[];
  activeId: string | null;
}

// Where the order goes: street, (landmark), city, state, pincode.
export function addressLocation(address: SavedAddress): string {
  const landmark = address.landmark ? `(Landmark: ${address.landmark})` : '';
  return [address.street, landmark, address.city, address.state, address.zip].filter(Boolean).join(', ');
}

// The one line sent to the store with the order, same shape as the website's.
export function addressText(address: SavedAddress): string {
  return [address.recipientName, addressLocation(address), address.phone ? `Ph: ${address.phone}` : ''].filter(Boolean).join(', ');
}

async function readBook(userId: string): Promise<AddressBook> {
  try {
    const raw = await getItem(`easycart.addresses.${userId}`);
    if (!raw) return { list: [], activeId: null };
    const parsed = JSON.parse(raw) as AddressBook;
    return { list: Array.isArray(parsed.list) ? parsed.list : [], activeId: parsed.activeId ?? null };
  } catch {
    return { list: [], activeId: null };
  }
}

export function useAddresses() {
  const { user } = useSession();
  const userId = user?.id ?? 'guest';
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['addresses', userId], queryFn: () => readBook(userId), staleTime: Infinity, refetchInterval: false });

  const book = query.data ?? { list: [], activeId: null };
  const active = book.list.find((address) => address.id === book.activeId) ?? book.list[0] ?? null;

  const write = useCallback(async (next: AddressBook) => {
    queryClient.setQueryData(['addresses', userId], next);
    await setItem(`easycart.addresses.${userId}`, JSON.stringify(next));
  }, [queryClient, userId]);

  // Saving a new address makes it the active one, like the website.
  const save = useCallback(async (address: SavedAddress) => {
    const exists = book.list.some((item) => item.id === address.id);
    const list = exists ? book.list.map((item) => (item.id === address.id ? address : item)) : [...book.list, address];
    await write({ list, activeId: exists ? book.activeId : address.id });
  }, [book, write]);

  const remove = useCallback(async (id: string) => {
    const list = book.list.filter((item) => item.id !== id);
    await write({ list, activeId: book.activeId === id ? list[0]?.id ?? null : book.activeId });
  }, [book, write]);

  const setActive = useCallback((id: string) => write({ list: book.list, activeId: id }), [book, write]);

  return { addresses: book.list, active, isLoading: query.isLoading, save, remove, setActive };
}
