import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ZoneSearchProps {
  // Mapping: Municipality -> List of Colonies
  groupedZones: Record<string, string[]>;
  selectedColony: string | null;
  onColonyChange: (colony: string | null) => void;
  selectedMunicipality: string | null;
  onMunicipalityChange: (municipio: string | null) => void;
}

export function ZoneSearch({
  groupedZones,
  selectedColony,
  onColonyChange,
  selectedMunicipality,
  onMunicipalityChange,
}: ZoneSearchProps) {
  const municipalities = Object.keys(groupedZones).sort();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2 py-1">
      {/* Municipios - Horizontal Scroll */}
      <div className="flex flex-col">
        <ScrollArea className="w-full whitespace-nowrap pb-3">
          <div className="flex gap-2">
            {municipalities.map((muni) => (
              <Button
                key={muni}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMunicipality === muni) {
                    onMunicipalityChange(null);
                  } else {
                    onMunicipalityChange(muni);
                  }
                }}
                className={cn(
                  "rounded-full px-5 h-8 border-white/20 transition-all text-sm",
                  selectedMunicipality === muni
                    ? "bg-white text-navbar border-white font-bold"
                    : "bg-white/10 text-white hover:bg-white/20",
                )}
              >
                {muni}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-white/10" />
        </ScrollArea>
      </div>

      {/* Colonias - Horizontal Scroll (Visible when muni is selected) */}
      {selectedMunicipality && groupedZones[selectedMunicipality] && (
        <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
          <ScrollArea className="w-full whitespace-nowrap pb-3">
            <div className="flex gap-2">
              {groupedZones[selectedMunicipality].map((colony) => (
                <Badge
                  key={colony}
                  variant={selectedColony === colony ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer px-4 py-1.5 rounded-full text-sm transition-all border-none font-medium",
                    selectedColony === colony
                      ? "bg-primary text-white scale-105 shadow-md"
                      : "bg-white/10 text-white/90 hover:bg-white/20",
                  )}
                  onClick={() =>
                    onColonyChange(selectedColony === colony ? null : colony)
                  }
                >
                  {colony}
                  {selectedColony === colony && (
                    <X className="ml-1.5 h-3.5 w-3.5" />
                  )}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="bg-white/10" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
