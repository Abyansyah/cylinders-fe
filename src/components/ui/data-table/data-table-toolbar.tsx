'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };
  filterableColumns?: {
    id: string;
    title: string;
    options: {
      label: string;
      value: string;
    }[];
  }[];
  onFilterChange?: (key: string, value: string) => void;
}

export function DataTableToolbar<TData>({ table, search, filterableColumns = [], onFilterChange }: DataTableToolbarProps<TData>) {
  const searchParams = useSearchParams();
  const isFiltered = !!searchParams.get('search') || !!searchParams.get('role_id') || !!searchParams.get('is_active');

  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {search && (
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={search.placeholder || 'Search...'} value={search.value} onChange={(event) => search.onChange(event.target.value)} className="pl-8" />
          </div>
        )}
        {filterableColumns.map(
          (column) =>
            table.getColumn(column.id) && (
              <div key={column.id} className="hidden sm:flex">
                <Select value={searchParams.get(column.id) ?? ''} onValueChange={(value) => onFilterChange?.(column.id, value === 'all' ? '' : value)}>
                  <SelectTrigger className="h-9 w-[150px]">
                    <SelectValue placeholder={`Filter ${column.title}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {column.title}</SelectItem>
                    {column.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
        )}
        {/* {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('search');
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )} */}
      </div>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value: any) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
