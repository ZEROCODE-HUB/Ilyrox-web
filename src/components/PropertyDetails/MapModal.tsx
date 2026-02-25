import { MapPin, TriangleAlert } from "lucide-react";
import MapViewModal from "../Map/MapViewModal";
import { Modal } from "../ui/Modal";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
}

export const MapModal = ({ isOpen, onClose, property }: MapModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubicación de la propiedad"
      size="lg"
    >
      <div className="space-y-4 p-3">
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          <span>
            {property.calle}, {property.ciudad || property.municipio},{" "}
            {property.estado}
          </span>
        </div>

        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <MapViewModal
            centerLocation={{
              lat: property.latitud || 0,
              lng: property.longitud || 0,
            }}
          />
        </div>

        <div className="flex items-center text-muted-foreground">
          <TriangleAlert className="h-4 w-4 mr-2" />
          <p className="text-sm">
            Ubicación aproximada de la propiedad. El mapa muestra la zona
            general por motivos de privacidad.
          </p>
        </div>
      </div>
    </Modal>
  );
};
