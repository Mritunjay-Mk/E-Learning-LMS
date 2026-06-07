import Button from './Button';

export default function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span className="rounded-xl bg-white/70 px-4 py-2 text-sm font-bold text-ink">
        Page {page} of {pages}
      </span>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}
