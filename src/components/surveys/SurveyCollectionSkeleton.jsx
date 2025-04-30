export default function SurveyCollectionSkeleton() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gray-300 rounded-full" />
          <div className="w-48 h-6 bg-gray-300 rounded" />
        </div>
        <div className="w-12 h-6 bg-gray-300 rounded-full" />
      </div>

      <div className="space-y-2">
        <div className="w-40 h-4 bg-gray-300 rounded" />
        <div className="w-60 h-4 bg-gray-300 rounded" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-40 h-5 bg-gray-300 rounded" />
          <div className="w-10 h-5 bg-gray-300 rounded-full" />
        </div>

        <div className="space-y-4">
          <div className="w-full h-10 bg-gray-300 rounded" />
          <div className="w-full h-10 bg-gray-300 rounded" />
          <div className="flex gap-4 justify-center pt-4">
            <div className="w-24 h-10 bg-gray-300 rounded" />
            <div className="w-24 h-10 bg-gray-300 rounded" />
          </div>
        </div>
      </div>

      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-40 h-5 bg-gray-300 rounded" />
            <div className="w-10 h-5 bg-gray-300 rounded-full" />
          </div>
          <div className="w-full h-36 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );
}
