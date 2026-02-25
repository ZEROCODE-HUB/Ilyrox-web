import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Radius } from "lucide-react";
import { UserLocation } from "@/types/property";
import { useEffect, useState } from "react";

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
  // Local state for immediate visual feedback
  const [localRadius, setLocalRadius] = useState(radiusKm);

  // Sync local state with prop (e.g., when filters are cleared)
  useEffect(() => {
    setLocalRadius(radiusKm);
  }, [radiusKm]);

  return (
    <Card className="p-4 border-t-0 rounded-t-none mb-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Radius
            className={`h-4 w-4 ${!userLocation ? "text-muted-foreground" : "text-primary"}`}
          />
          Radio de búsqueda: {localRadius} km
        </Label>
        <div className="px-2">
          <Slider
            value={[localRadius]}
            onValueChange={(value) => setLocalRadius(value[0])}
            onValueCommit={(value) => onRadiusChange(value[0])}
            max={50}
            min={0}
            step={0.1}
            className="w-full"
            disabled={!userLocation}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0 km</span>
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
