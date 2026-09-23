export function SkeletonLine({ className = 'h-4 w-full rounded-lg' }) {
  return <div className={`skeleton ${className}`} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="glass w-full max-w-[360px] mx-auto rounded-2xl p-3 shadow-sm">
      <SkeletonLine className="aspect-video w-full rounded-xl" />
      <div className="space-y-2.5 p-2 pt-3">
        <SkeletonLine className="h-3 w-24 rounded-md" />
        <SkeletonLine className="h-5 rounded-md" />
        <SkeletonLine className="h-3 w-4/5 rounded-md" />
        <SkeletonLine className="h-9 rounded-xl mt-3" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-7xl place-items-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-6 shadow-sm">
        <SkeletonLine className="h-8 w-2/3 rounded-xl" />
        <div className="mt-5 space-y-3">
          <SkeletonLine />
          <SkeletonLine className="h-4 w-5/6 rounded-lg" />
          <SkeletonLine className="h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
