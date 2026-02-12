import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface ZoneSearchProps {
  selectedZones: Zone[];
  onZonesChange: (zones: Zone[]) => void;
  availableZones: Zone[];
}

export function ZoneSearch({ selectedZones, onZonesChange, availableZones }: ZoneSearchProps) {
  const handleZoneToggle = (zone: Zone) => {
    if (selectedZones.find(z => z.id === zone.id)) {
      onZonesChange(selectedZones.filter(z => z.id !== zone.id));
    } else {
      onZonesChange([...selectedZones, zone]);
    }
  };

  const isSelected = (zoneId: string) => selectedZones.some(z => z.id === zoneId);

  return (
    <div className="space-y-1.5">
      <p className="text-lg text-white font-medium pl-1">Búsqueda por zonas o colonias</p>
      
      {/* Zonas disponibles */}
      <div className="flex flex-wrap gap-2.5">
        {availableZones.map((zone) => (
          <Badge
            key={zone.id}
            variant={isSelected(zone.id) ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors px-4 py-2 text-sm text-white border-white/40"
            onClick={() => handleZoneToggle(zone)}
          >
            {zone.name}
            {isSelected(zone.id) && (
              <X className="ml-1.5 h-3.5 w-3.5" />
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}
