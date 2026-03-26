import Skeleton from "react-loading-skeleton";

export const SkeletonSearch = () => {
  return (
    <div className="py-3 px-3 flex items-center gap-3 group">
      <div className="">
        <Skeleton className="rounded-full w-9 h-9 ml-1" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton height={12} width="50%" />
        <Skeleton height={10} width="30%" />
      </div>
      <Skeleton
        height={15}
        width="10%"
        className="flex-shrink-0 w-10 px-7 py-1 rounded-full"
      />
    </div>
  );
};
