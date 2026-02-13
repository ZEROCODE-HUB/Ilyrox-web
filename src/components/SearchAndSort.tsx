import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { propertyService } from "@/services/propertyService";

interface SearchAndSortProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedState?: string;
  onStateChange?: (state: string) => void;
  onMunicipalityChange?: (municipality: string) => void;
  onColonyChange?: (colony: string) => void;
  onLocationSearch?: () => void;
  onFocus?: () => void;
}

export function SearchAndSort({
  searchTerm,
  onSearchChange,
  onLocationSearch,
  selectedState,
  onStateChange,
  onMunicipalityChange,
  onColonyChange,
  onFocus,
}: SearchAndSortProps) {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<
    { name: string; type: "estado" | "municipio" | "colonia" }[]
  >([]);

  // Sort helpers
  const getTypePriority = (type: string) => {
    switch (type) {
      case "estado":
        return 1;
      case "municipio":
        return 2;
      case "colonia":
        return 3;
      default:
        return 4;
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchLocations = async () => {
      try {
        const data = await propertyService.getLocationsForProperty();
        if (mounted && data) {
          const locsMap = new Map<string, "estado" | "municipio" | "colonia">();
          data.forEach((item: any) => {
            if (item.estado) locsMap.set(item.estado, "estado");
            if (item.municipio) locsMap.set(item.municipio, "municipio");
            if (item.colonia) locsMap.set(item.colonia, "colonia");
          });
          const sortedLocs = Array.from(locsMap.entries())
            .map(([name, type]) => ({ name, type }))
            .sort((a, b) => {
              const priorityA = getTypePriority(a.type);
              const priorityB = getTypePriority(b.type);
              if (priorityA !== priorityB) {
                return priorityA - priorityB;
              }
              return a.name.localeCompare(b.name);
            });
          setLocations(sortedLocs);
        }
      } catch (error) {
        console.error("Error fetching locations", error);
      }
    };
    fetchLocations();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredLocations = searchTerm
    ? locations
        .filter((loc) =>
          loc.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .slice(0, 10)
    : [];

  return (
    <div className="flex-1 max-w-2xl relative">
      <Popover
        open={open && filteredLocations.length > 0}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Buscar por ciudad, zona, código..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                setOpen(true);
                if (onFocus) onFocus();
              }}
              className="pl-10 pr-12 bg-white w-full shadow-sm"
            />
            {onLocationSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onLocationSearch();
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                title="Usar mi ubicación"
              >
                <MapPin className="h-4 w-4 text-primary" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command>
            <CommandList>
              {filteredLocations.map((loc) => (
                <CommandItem
                  key={`${loc.type}-${loc.name}`}
                  value={loc.name}
                  onSelect={() => {
                    onSearchChange(loc.name);
                    if (loc.type === "estado" && onStateChange) {
                      onStateChange(loc.name);
                    } else if (
                      loc.type === "municipio" &&
                      onMunicipalityChange
                    ) {
                      onMunicipalityChange(loc.name);
                    } else if (loc.type === "colonia" && onColonyChange) {
                      onColonyChange(loc.name);
                    }
                    setOpen(false);
                  }}
                  className="cursor-pointer mx-1 my-0.5 rounded-lg hover:bg-slate-100 transition-colors py-2 px-3"
                >
                  <MapPin className="mr-3 h-4 w-4 text-primary" />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{loc.name}</span>
                    <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {loc.type}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
