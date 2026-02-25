import { resenasService } from "@/services/resenasService";
import { useEffect, useState } from "react";

export const useResenas = (asesor_id: string) => {
  const [reviewsData, setReviewsData] = useState({
    average: 0,
    total: 0,
    breakdown: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  useEffect(() => {
    const fetchReviews = async () => {
      if (!asesor_id) return;

      const data = await resenasService(asesor_id);

      if (data && data.length > 0) {
        const total = data.length;
        const sum = data.reduce(
          (acc, curr) => acc + (curr.calificacion_general || 0),
          0,
        );
        const average = parseFloat((sum / total).toFixed(1));

        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach((r) => {
          const rating = Math.round(
            r.calificacion_general,
          ) as keyof typeof breakdown;
          if (breakdown[rating] !== undefined) {
            breakdown[rating]++;
          }
        });

        setReviewsData({ average, total, breakdown });
      } else {
        setReviewsData({
          average: 0,
          total: 0,
          breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      }
    };

    fetchReviews();
  }, [asesor_id]);

  return { reviewsData };
};
