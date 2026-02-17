import { Card, CardContent } from "@/components/ui/card";
import Skeleton from "react-loading-skeleton";

export const SkeletonCard = () => {
  return (
    <Card className="flex flex-col h-full border-border bg-card">
      <Skeleton height={192} className="rounded-t-lg" />
      <CardContent className="px-4 pt-4 pb-0 flex flex-col gap-3">
        <div className="space-y-2">
          <Skeleton height={24} width="80%" />
          <Skeleton height={16} width="60%" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton height={32} width={100} />
          <Skeleton height={24} width={80} />
        </div>
        <div className="flex gap-4">
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
        </div>
        <div className="pt-4 pb-[15px]">
          <Skeleton height={40} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
