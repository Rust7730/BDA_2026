import { query } from '@/lib/db';
import Link from 'next/link';

interface BestBuyer {
  usuario_id: number;
  usuario_nombre: string;
  email: string;
  ordenes_count: string | number; 
  nivel_lealtad: string;          
}
export default async function BestBuyersPage() {
  // --- SERVER SIDE ---
  let rows: BestBuyer[] = [];
  let errorMsg = null;

  try {
    const result = await query('SELECT * FROM vw_greater_buyers');
    rows = result.rows;
  } catch (error: any) {
    console.error('Error BD:', error);
    errorMsg = error.message;
  }

  const totalOrdenesVIP = rows.reduce((acc, row) => acc + Number(row.ordenes_count), 0);

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

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Top Clientes Frecuentes
          </h1>
          <p className="text-gray-600 mt-2">
            Usuarios que han realizado 4 o más compras, clasificados por lealtad.
          </p>
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
                Órdenes de Clientes Top
              </h3>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-4xl font-extrabold text-green-700">
                  {totalOrdenesVIP}
                </p>
                <span className="mb-1 text-sm text-gray-500 font-medium">compras totales</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Generadas por tus {rows.length} mejores clientes.
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
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeColor(row.nivel_lealtad)}`}>
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
                  Aún no hay clientes con más de 4 compras.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}