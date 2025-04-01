// components/ui/UserCardSkeleton.jsx
export default function UserCardSkeleton() {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }
  