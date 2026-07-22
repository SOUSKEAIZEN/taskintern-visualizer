export default function PortalLoading() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-bg-main relative overflow-hidden">
      <div className="max-w-4xl w-full flex flex-col items-center animate-pulse">
        <div className="h-12 bg-bg-card rounded-md w-1/2 mb-4 border border-border-default"></div>
        <div className="h-4 bg-bg-card rounded-md w-1/3 mb-12 border border-border-default"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          <div className="h-64 bg-bg-card rounded-[2rem] border border-border-default"></div>
          <div className="h-64 bg-bg-card rounded-[2rem] border border-border-default"></div>
        </div>
      </div>
    </div>
  );
}
