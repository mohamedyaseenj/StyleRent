export default function DataTable({ columns, data, onEdit, onDelete, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-text-light py-8">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-alt">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-border">
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-surface-alt transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {onEdit && (
                    <button onClick={() => onEdit(row)} className="text-accent hover:text-accent-hover mr-3">
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(row)} className="text-danger hover:text-red-700">
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
