import Sidebar from "../../../../components/workspace/Sidebar";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar mode="learn" />
      <main className="flex-1 overflow-hidden relative bg-bg-main/50">
        {children}
      </main>
    </div>
  );
}
