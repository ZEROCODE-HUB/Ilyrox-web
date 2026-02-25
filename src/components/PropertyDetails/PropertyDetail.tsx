import { useState, useEffect } from "react";
import { PropertyView } from "@/types/types";
import { Modal } from "../ui/Modal";
import { PropertyDetailContent } from "./PropertyDetailContent";

interface PropertyDetailProps {
  property: PropertyView | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyDetail({
  property,
  isOpen,
  onClose,
}: PropertyDetailProps) {
  const [activeProperty, setActiveProperty] = useState<PropertyView | null>(
    null,
  );

  // Mantener la propiedad activa mientras el modal esté abierto para permitir animaciones de salida
  useEffect(() => {
    if (property) {
      setActiveProperty(property);
    }
  }, [property]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeProperty
          ? `${activeProperty.tipo.charAt(0).toUpperCase() + activeProperty.tipo.slice(1)} en ${activeProperty.municipio}`
          : ""
      }
      size="full"
    >
      {activeProperty && <PropertyDetailContent property={activeProperty} />}
    </Modal>
  );
}
