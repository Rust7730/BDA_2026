'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
       <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 border rounded bg-green-100 text-green-700 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-green-200'}`}
        aria-disabled={currentPage <= 1}
      >
        &larr; Anterior
      </Link>
      
      <span className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </span>

      <Link
        href={createPageURL(currentPage + 1)}
        className={`px-4 py-2 border rounded bg-green-100 text-green-700 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-green-200'}`}
        aria-disabled={currentPage >= totalPages}
      >
        Siguiente &rarr;
      </Link>
    </div>
  );
}