function getPageNumbers(page, totalPages) {
  const pages = []
  const delta = 1

  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return pages
}

function Pagination({ page, totalPages, hasPrev, hasNext, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  const pages = getPageNumbers(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1 pt-4">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={!hasPrev}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-accent-mist transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              p === page
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-accent-mist'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!hasNext}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-accent-mist transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination
