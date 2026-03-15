export default function LessonLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="h-4 bg-gray-200 rounded w-2" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-2" />
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-2" />
        <div className="h-4 bg-gray-200 rounded w-40" />
      </div>

      {/* Lesson header skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="h-6 bg-gray-200 rounded-full w-36" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-24" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="flex flex-wrap gap-4">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-5 bg-gray-200 rounded w-24" />
        </div>
      </div>

      {/* Lesson content skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        {/* Tabs skeleton */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <div className="h-8 bg-gray-200 rounded w-16 mb-0" />
          <div className="h-8 bg-gray-200 rounded w-24 mb-0" />
          <div className="h-8 bg-gray-200 rounded w-16 mb-0" />
        </div>

        {/* Article skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-2/5 mt-6" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="h-32 bg-gray-200 rounded-lg w-full mt-6" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>

        {/* Complete button skeleton */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <div className="h-12 bg-gray-200 rounded-xl w-full max-w-xs mx-auto" />
        </div>
      </div>

      {/* Navigation skeleton */}
      <div className="flex justify-between gap-4 mt-4">
        <div className="h-16 bg-gray-200 rounded-lg flex-1" />
        <div className="h-16 bg-gray-200 rounded-lg flex-1" />
      </div>
    </div>
  );
}
