import { query } from '@/lib/db';
import Link from 'next/link';
import { TopProductSchema, type TopProduct } from '@/lib/schemas'; 
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export default async function TopProductsPage() {

  let rows: TopProduct[] = [];
  let errorMsg = null;

  try {
    const result = await query('SELECT * FROM vw_Topn_prodcuts');
    
  
    rows = z.array(TopProductSchema).parse(result.rows);

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
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Volver al Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Top Productos</h1>
        <p className="text-gray-600 mt-2">Productos con mayor recaudación histórica.</p>

        {errorMsg && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            <strong>Error conectando a la BD:</strong> {errorMsg}
          </div>
        )}

        {!errorMsg && (
          <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventas Totales</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((product) => (
                  <tr key={product.producto_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.producto_nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
                        .format(Number(product.monto_total_vendido))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {rows.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No hay datos.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}