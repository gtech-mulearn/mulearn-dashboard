import type { PreviewRow } from "../schemas";

/** Exactly what µLearn sends: the backend builds these rows from the same code as the request. */
export function SharedDataTable({ rows }: { rows: PreviewRow[] }) {
  return (
    <dl className="divide-y rounded-lg border text-sm">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(0,7rem)_1fr] gap-3 px-3 py-2"
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="min-w-0">
            {/* Wraps at word boundaries; only an unbreakable value (an email) is split. */}
            <span className="font-medium wrap-anywhere">{row.value}</span>
            {row.note ? (
              <span className="block text-xs text-muted-foreground">
                {row.note}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
