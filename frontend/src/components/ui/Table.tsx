import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading,
  pagination,
}: TableProps<T>) {
  return (
    <div className="table-wrapper">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key as string}>{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="loading-cell">
                  <div className="loading-spinner" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-cell">
                  Нет данных
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key as string}>
                      {column.render
                        ? column.render(record[column.key as keyof T], record)
                        : record[column.key as keyof T]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="pagination">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => pagination.onChange(pagination.current - 1)}
            disabled={pagination.current === 1}
          >
            <ChevronLeft size={16} />
          </Button>

          <span className="pagination-info">
            {pagination.current} из {Math.ceil(pagination.total / pagination.pageSize)}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => pagination.onChange(pagination.current + 1)}
            disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      <style>{`
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          border-radius: var(--radius);
        }
        .table-container {
          min-width: 800px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .table th {
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .table td {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }
        .table tbody tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .loading-cell,
        .empty-cell {
          text-align: center;
          padding: 40px !important;
          color: rgba(255, 255, 255, 0.5);
        }
        .loading-spinner {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .pagination {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
          padding: 16px;
        }
        .pagination-info {
          color: white;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}