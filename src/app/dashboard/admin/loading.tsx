export default function Loading() { 
  return (
    <div className="p-8 space-y-8 animate-pulse w-full max-w-7xl mx-auto">
      <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
      <div className="h-4 bg-slate-100 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <div className="h-32 bg-slate-100 rounded-2xl"></div>
        <div className="h-32 bg-slate-100 rounded-2xl"></div>
        <div className="h-32 bg-slate-100 rounded-2xl"></div>
        <div className="h-32 bg-slate-100 rounded-2xl"></div>
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl w-full mt-6"></div>
    </div>
  );
}
