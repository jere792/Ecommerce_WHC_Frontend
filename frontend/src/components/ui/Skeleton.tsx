interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-4xl shadow-md border border-blue-100 w-[280px] h-[320px] flex flex-col justify-between mx-auto">
      <div className="h-32 w-full flex items-center justify-center p-4">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
      <div className="flex-1 flex flex-col px-4 py-3 justify-between gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-gray-200">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />
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
        <Skeleton className="h-10 w-64 mx-auto mb-3 rounded-lg" />
        <Skeleton className="h-6 w-96 max-w-full mx-auto rounded-lg" />
      </div>
    </section>
  );
}
