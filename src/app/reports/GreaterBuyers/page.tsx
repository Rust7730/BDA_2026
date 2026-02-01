import { query } from '@/lib/db';
import Link from 'next/link';
import { z } from 'zod';
import { BestBuyerSchema, type BestBuyer } from '@/lib/schemas';

export const dynamic = 'force-dynamic';
export default async function BestBuyersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const ITEMS_PER_PAGE = 4; 
  const currentPage = Number(searchParams.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let rows: BestBuyer[] = [];
  let totalPages = 0;
  let errorMsg = null;
  let totalOrdenesPagina = 0; 

  try {
    const countResult = await query('SELECT COUNT(*) FROM vw_greater_buyers');
    const totalItems = Number(countResult.rows[0].count);
    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const result = await query(
      'SELECT * FROM vw_greater_buyers ORDER BY ordenes_count DESC LIMIT $1 OFFSET $2',
      [ITEMS_PER_PAGE, offset]
    );
    
    rows = z.array(BestBuyerSchema).parse(result.rows);

    totalOrdenesPagina = rows.reduce((acc, row) => acc + Number(row.ordenes_count), 0);

  } catch (error: any) {
    console.error('Error de validación o BD:', error);
    if (error instanceof z.ZodError) {
      errorMsg = "Error en la integridad de los datos: " + error.issues[0].message;
    } else {
      errorMsg = error.message;
    }
  }

  const getBadgeColor = (nivel: string) => {
    if (nivel.includes('VIP')) return 'bg-[#000000] text-[#FFD700] border-[#D1B200]';
    if (nivel.includes('Leal')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block font-medium">
          &larr; Volver al Dashboard
        </Link>

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Top Clientes Frecuentes
            </h1>
            <p className="text-gray-600 mt-2">
              Usuarios que han realizado 4 o más compras.
            </p>
          </div>
          {!errorMsg && (
             <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full">
               Página {currentPage} de {totalPages || 1}
             </span>
          )}
        </header>

        {errorMsg && (
          <div className="p-4 bg-red-100 text-red-700 rounded mb-6 border border-red-200">
            Error: {errorMsg}
          </div>
        )}

        {!errorMsg && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 border-l-4 border-l-green-600 mb-8 w-full md:w-1/3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                Órdenes (Esta Página)
              </h3>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-4xl font-extrabold text-green-700">
                  {totalOrdenesPagina}
                </p>
                <span className="mb-1 text-sm text-gray-500 font-medium">compras</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Realizadas por los {rows.length} clientes listados abajo.
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Nivel
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total Órdenes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row) => (
                    <tr key={row.usuario_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs mr-3">
                            {row.usuario_nombre.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {row.usuario_nombre}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeColor(row.nivel_lealtad ?? '')}`}>
                          {row.nivel_lealtad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-800">
                        {row.ordenes_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rows.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  No hay datos en esta página.
                </div>
              )}

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                
                <div>
                  {currentPage > 1 ? (
                    <Link
                      href={`?page=${currentPage - 1}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      &larr; Anterior
                    </Link>
                  ) : (
                    <button disabled className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
                      &larr; Anterior
                    </button>
                  )}
                </div>

                <div>
                  {currentPage < totalPages ? (
                    <Link
                      href={`?page=${currentPage + 1}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Siguiente &rarr;
                    </Link>
                  ) : (
                    <button disabled className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
                      Siguiente &rarr;
                    </button>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </main>
  );
}