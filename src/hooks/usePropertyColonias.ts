import { locationService } from "@/services/locationService";
import { useEffect, useState } from "react";

export const usePropertyColonias = (estado: string) => {
  const [colonias, setColonias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (estado) {
      getColonias();
    }
  }, [estado]);

  const getColonias = async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocationsForProperty(estado);
      setColonias(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    colonias,
    loading,
    error,
  };
};
