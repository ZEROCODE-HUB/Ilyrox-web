import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Radius } from "lucide-react";
import { UserLocation } from "@/types/property";

interface MapControlsProps {
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  userLocation: UserLocation | null;
}

export function MapControls({
  radiusKm,
  onRadiusChange,
  userLocation,
}: MapControlsProps) {
  return (
    <Card className="p-4 border-t-0 rounded-t-none mb-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Radius
            className={`h-4 w-4 ${!userLocation ? "text-muted-foreground" : "text-primary"}`}
          />
          Radio de búsqueda: {radiusKm} km
        </Label>
        <div className="px-2">
          <Slider
            value={[radiusKm]}
            onValueChange={(value) => onRadiusChange(value[0])}
            max={50}
            min={0.1}
            step={0.1}
            className="w-full"
            disabled={!userLocation}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0.1 km</span>
            <span>50 km</span>
          </div>
          {!userLocation && (
            <p className="text-xs text-muted-foreground mt-1">
              Activa tu ubicación para usar el radio de búsqueda
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
