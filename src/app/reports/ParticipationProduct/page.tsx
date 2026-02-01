import { query } from '@/lib/db';
import Link from 'next/link';
import { z } from 'zod';
import { ProductShareSchema,type ProductShare } from '@/lib/schemas';


export const dynamic = 'force-dynamic';
export default async function MarketSharePage() {
    let rows: ProductShare[] = [];
    let errorMsg = null;  
  try {
      const result = await query('SELECT * FROM vw_participacion_producto');
      
    
      rows = z.array(ProductShareSchema).parse(result.rows);
  
    } catch (error: any) {
      console.error('Error de validación o BD:', error);
      if (error instanceof z.ZodError) {
        errorMsg = "Error en la integridad de los datos: " + error.issues[0].message;
      } else {
        errorMsg = error.message;
      }
    }
  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'Producto Estrella': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Producto Medio': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block font-medium">
          &larr; Volver al Dashboard
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Participación de Mercado (Pareto)
          </h1>
          <p className="text-gray-600 mt-2">
            Análisis de qué productos sostienen las ventas de cada categoría.
          </p>
        </header>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Ventas ($)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Participación %</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row) => (
                <tr key={row.producto_id} className="hover:bg-gray-50">
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                    {row.categoria}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {row.producto_nombre}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(row.ventas_producto))}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <div className="w-full max-w-[140px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold">{row.participacion_pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${row.participacion_pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeColor(row.clasificacion)}`}>
                      {row.clasificacion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rows.length === 0 && (
             <div className="p-8 text-center text-gray-500">No hay datos de ventas para calcular participaciones.</div>
          )}
        </div>
      </div>
    </main>
  );
}