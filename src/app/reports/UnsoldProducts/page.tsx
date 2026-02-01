import { query } from '@/lib/db';
import Link from 'next/link';
import { z } from 'zod';
// Asegúrate de que la ruta de importación sea correcta según tu estructura
import { UnsoldProductSchema, type UnsoldProducts } from '@/lib/schemas';

export default async function UnsoldProductsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const ITEMS_PER_PAGE = 5; 
  const currentPage = Number(searchParams.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let rows: UnsoldProducts[] = [];
  let totalPages = 0;
  let errorMsg = null;

  try {
   
    const countResult = await query('SELECT COUNT(*) FROM vw_Unsold_Products');
    const totalItems = Number(countResult.rows[0].count);
    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const result = await query(
      'SELECT * FROM vw_Unsold_Products LIMIT $1 OFFSET $2',
      [ITEMS_PER_PAGE, offset]
    );

    rows = z.array(UnsoldProductSchema).parse(result.rows);

  } catch (error: any) {
    console.error('Error de validación o BD:', error);
    if (error instanceof z.ZodError) {
      errorMsg = "Error en la integridad de los datos: " + error.issues[0].message;
    } else {
      errorMsg = error.message;
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block font-medium">
          &larr; Volver al Dashboard
        </Link>
        
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos no vendidos</h1>
            <p className="text-gray-600 mt-2">Productos que nunca se han movido.</p>
          </div>
          {/* Indicador de página */}
          {!errorMsg && (
             <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full">
               Página {currentPage} de {totalPages || 1}
             </span>
          )}
        </header>

        {errorMsg && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {!errorMsg && (
          <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Capital Estancado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((product) => (
                  <tr key={product.producto_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.producto_nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-mono">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
                        .format(Number(product.capital_estancado))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {rows.length === 0 && (
              <div className="p-12 text-center text-gray-500">
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
        )}
      </div>
    </main>
  );
}