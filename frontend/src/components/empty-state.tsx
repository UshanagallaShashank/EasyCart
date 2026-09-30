export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-md border border-dashed py-12">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
