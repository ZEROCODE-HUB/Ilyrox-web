import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, MapPin, SortAsc, SortDesc } from 'lucide-react';

interface SearchAndSortProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onLocationSearch?: () => void;
  resultsCount: number;
}

export function SearchAndSort({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onLocationSearch,
  resultsCount
}: SearchAndSortProps) {
  return (
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar propiedades por estado o ciudad..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-12"
        />
        {onLocationSearch && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLocationSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}