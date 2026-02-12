import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Radius } from 'lucide-react';

interface MapControlsProps {
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
}

export function MapControls({
  radiusKm,
  onRadiusChange
}: MapControlsProps) {
  return (
    <Card className="p-4 border-t-0 rounded-t-none mb-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Radius className="h-4 w-4 text-primary" />
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
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0.1 km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>
    </Card>
  );
}