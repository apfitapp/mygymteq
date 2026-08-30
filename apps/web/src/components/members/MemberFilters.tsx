import React from 'react';
import { SearchBar } from '@/components/shared/SearchBar';

interface MemberFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  totalFound: number;
}

export const MemberFilters: React.FC<MemberFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalFound,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name, phone, code..."
      />

      <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-lg border border-border">
        {(['ALL', 'ACTIVE', 'EXPIRED', 'FROZEN'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusFilterChange(s)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              statusFilter === s
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'ALL' ? 'All Members' : s === 'ACTIVE' ? 'Active' : s === 'EXPIRED' ? 'Expired' : 'Frozen'}
          </button>
        ))}
      </div>

      <span className="sm:ml-auto text-xs text-muted-foreground font-mono">
        {totalFound} member{totalFound !== 1 ? 's' : ''} found
      </span>
    </div>
  );
};
