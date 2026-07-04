interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white shadow-md border border-blue-100 w-full flex flex-col mx-auto">
      <div className="h-48 sm:h-56 w-full flex items-center justify-center p-4">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-20" />
        <div className="flex justify-end mt-1">
          <Skeleton className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="relative w-full h-[280px] sm:h-[420px] md:h-[550px] lg:h-[650px] overflow-hidden bg-gray-200">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-2.5 h-2.5" />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full max-full mx-auto overflow-hidden shadow-xl">
      <Skeleton className="w-full md:h-[140px] h-[100px]" />
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gray-300" />
    </div>
  );
}

export function PageHeroSkeleton() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
      <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
        <Skeleton className="h-10 w-64 mx-auto mb-3" />
        <Skeleton className="h-6 w-96 max-w-full mx-auto" />
      </div>
    </section>
  );
}
