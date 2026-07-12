import Link from "next/link";
import { auth } from "../../auth";
import { redirect } from "next/navigation";

export default async function PortalPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      <div className="z-10 text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Welcome back, {session.user?.name || "Developer"}
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Choose your module. Do you want to visualize data structures or test your skills in the compiler?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        
        {/* Learning Portal Card */}
        <Link href="/learn" className="group">
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 h-full flex flex-col justify-center items-center text-center cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500 z-10">
              📚
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 mb-4 z-10">DSA Theory & Visualizer</h2>
            <p className="text-slate-500 text-lg z-10">
              Master the core concepts of Data Structures and Algorithms with interactive, frame-by-frame visual engines.
            </p>
            
            <div className="mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md group-hover:bg-indigo-700 transition-colors z-10">
              Enter Learning Portal →
            </div>
          </div>
        </Link>

        {/* Practice Portal Card */}
        <Link href="/practice" className="group">
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 h-full flex flex-col justify-center items-center text-center cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500 z-10">
              💻
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 mb-4 z-10">Practice & Compiler</h2>
            <p className="text-slate-500 text-lg z-10">
              Put your knowledge to the test. Solve curated LeetCode-style questions in an isolated Docker environment.
            </p>
            
            <div className="mt-8 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md group-hover:bg-emerald-700 transition-colors z-10">
              Enter Practice Engine →
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
