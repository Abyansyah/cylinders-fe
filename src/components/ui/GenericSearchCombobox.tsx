'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useSWR from 'swr';
import { useDebounce } from '@/hooks/use-debounce';

interface GenericSearchComboboxProps<T> {
  value: string;
  onChange: (value: string) => void;
  selectedData?: (item: T) => void;
  fetcher: (params: { search: string }) => Promise<{ data: T[] }>;
  labelExtractor: (item: T) => string;
  descriptionExtractor?: (item: T) => string;
  placeholder?: string;
  searchKey?: string;
}

export function GenericSearchCombobox<T>({ value, onChange, selectedData, fetcher, labelExtractor, descriptionExtractor, placeholder = 'Pilih item...', searchKey = 'search' }: GenericSearchComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 800);

  const { data: response, isLoading } = useSWR(`${searchKey}?search=${debouncedSearch}`, () => fetcher({ search: debouncedSearch }));

  const items = response?.data || [];
  const selectedItem = items.find((item) => (item as any).id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedItem ? (
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium">{labelExtractor(selectedItem)}</p>
              {descriptionExtractor && <p className="text-xs text-muted-foreground">{descriptionExtractor(selectedItem)}</p>}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Cari..." value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading && (
              <div className="p-2 text-sm text-center flex justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat...
              </div>
            )}
            <CommandEmpty>Data tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const label = labelExtractor(item);
                return (
                  <CommandItem
                    key={(item as any).id}
                    value={label}
                    onSelect={() => {
                      const selected = items.find((i) => labelExtractor(i) === label);
                      if (selected) {
                        onChange((selected as any).id.toString());
                        selectedData?.(selected);
                      }
                      setOpen(false);
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium leading-none">{label}</p>
                      {descriptionExtractor && <p className="text-xs text-muted-foreground">{descriptionExtractor(item)}</p>}
                    </div>
                    <Check className={cn('ml-auto', value === (item as any).id.toString() ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
