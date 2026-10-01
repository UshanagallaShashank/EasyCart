// Reads every row of a Supabase query in pages, since Supabase returns at most 1,000 rows per request.
const PAGE_SIZE = 1000;

export async function select_all_rows(build_query, page_size = PAGE_SIZE) {
  const rows = [];
  for (let from = 0; ; from += page_size) {
    const { data, error } = await build_query().range(from, from + page_size - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < page_size) return rows;
  }
}
