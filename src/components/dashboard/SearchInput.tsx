"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect, Suspense } from "react";

function SearchBoxInner({ 
  defaultValue, 
  placeholder = "Buscar...",
  queryParam = "q",
  width = "w-full sm:w-96"
}: { 
  defaultValue: string;
  placeholder?: string;
  queryParam?: string;
  width?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(defaultValue);

  // Keep local state in sync if the URL param changes externally
  useEffect(() => {
    setTerm(typeof searchParams.get(queryParam) === 'string' ? searchParams.get(queryParam)! : defaultValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set(queryParam, term);
        params.delete("page"); // reset pagination on new search
      } else {
        params.delete(queryParam);
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 350);

    return () => clearTimeout(timeOutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className={`relative ${width}`}>
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input 
        type="text" 
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all shadow-sm text-slate-700" 
      />
    </div>
  );
}

// Fallback shown until client JS loads (prevents layout shift)
function SearchBoxFallback({ placeholder, width = "w-full sm:w-96" }: { placeholder?: string; width?: string }) {
  return (
    <div className={`relative ${width}`}>
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        disabled
        placeholder={placeholder || "Buscar..."}
        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm shadow-sm text-slate-700 opacity-80"
      />
    </div>
  );
}

// Exported component - always wrapped in Suspense to avoid blocking page transitions
export function SearchBox(props: { 
  defaultValue: string;
  placeholder?: string;
  queryParam?: string;
  width?: string;
}) {
  return (
    <Suspense fallback={<SearchBoxFallback placeholder={props.placeholder} width={props.width} />}>
      <SearchBoxInner {...props} />
    </Suspense>
  );
}

// Backward compat alias
export const MovimientosSearchBox = ({ defaultValue }: { defaultValue: string }) => (
  <SearchBox defaultValue={defaultValue} placeholder="Buscar por descripción, referencia o ID..." />
);
