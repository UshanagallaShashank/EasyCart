// Splits an array into fixed-size chunks — used to keep Supabase .in() queries
// under the URL/header size limit when the id list can grow large (e.g. every
// tenant on the platform).
export function chunk_array(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
