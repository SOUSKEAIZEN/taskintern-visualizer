export default function DashboardLoading() {
  return (
    <div className="flex-1 overflow-auto bg-bg-main p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-10 bg-bg-card rounded-md w-1/3 mb-2 border border-border-default"></div>
        <div className="h-4 bg-bg-card rounded-md w-1/4 border border-border-default"></div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-card rounded-card p-6 h-32 border border-border-default shadow-sm"></div>
          <div className="bg-bg-card rounded-card p-6 h-32 border border-border-default shadow-sm"></div>
          <div className="bg-bg-card rounded-card p-6 h-32 border border-border-default shadow-sm"></div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-bg-card rounded-card p-6 h-64 border border-border-default shadow-sm"></div>
          <div className="bg-bg-card rounded-card p-6 h-64 border border-border-default shadow-sm"></div>
        </div>
      </div>
    </div>
  );
}
