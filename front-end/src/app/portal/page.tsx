import Link from "next/link";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import LogoutButton from "../../../components/LogoutButton";

export default async function PortalPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 gradient-hero relative overflow-hidden">
      
      {/* Top Corner Logout */}
      <div className="absolute top-6 right-6 z-50">
        <LogoutButton />
      </div>

      <div className="z-10 text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-[56px] font-heading font-extrabold text-text-heading tracking-tight mb-4 leading-tight">
          Welcome back, {session.user?.name || "Developer"}
        </h1>
        <p className="text-[16px] text-text-secondary font-body max-w-2xl mx-auto tracking-wide">
          Choose your module. Do you want to visualize data structures or test your skills in the compiler?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        
        {/* Learning Portal Card */}
        <Link href="/learn" className="group">
          <div className="bg-bg-card rounded-card p-10 border border-transparent hover:border-border-hover shadow-premium hover:shadow-premium-hover transition-all duration-300 h-full flex flex-col justify-center items-center text-center cursor-pointer hover:-translate-y-1 hover:scale-[1.02]">
            
            <div className="icon-container z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            
            <h2 className="text-[28px] font-heading font-bold text-text-heading mb-4 z-10">Theory & Visualizer</h2>
            <p className="text-text-secondary text-[16px] font-body z-10 leading-relaxed">
              Master the core concepts of Data Structures and Algorithms with interactive, frame-by-frame visual engines.
            </p>
            
            <div className="btn-secondary mt-8 z-10 w-full">
              Enter Learning Portal →
            </div>
          </div>
        </Link>

        {/* Practice Portal Card */}
        <Link href="/practice" className="group">
          <div className="bg-bg-card rounded-card p-10 border border-transparent hover:border-border-hover shadow-premium hover:shadow-premium-hover transition-all duration-300 h-full flex flex-col justify-center items-center text-center cursor-pointer hover:-translate-y-1 hover:scale-[1.02]">
            
            <div className="icon-container z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            
            <h2 className="text-[28px] font-heading font-bold text-text-heading mb-4 z-10">Practice & Compiler</h2>
            <p className="text-text-secondary text-[16px] font-body z-10 leading-relaxed">
              Put your knowledge to the test. Solve curated LeetCode-style questions in an isolated environment.
            </p>
            
            <div className="btn-secondary mt-8 z-10 w-full">
              Enter Practice Engine →
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
