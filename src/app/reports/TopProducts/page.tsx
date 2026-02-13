import { getTopProducts } from '@/lib/data';
import Search from '@/app/components/Search';
import Header from '@/app/components/Headder';

export default async function TopProductsPage(props: {
  searchParams?: Promise<{ query?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  
  const { data, error } = await getTopProducts(query);

  return (
    <main className="">
      <Header 
                                  title="Top 7 Productos Más Vendidos" 
                                  backUrl="/" 
                                  backText="Volver al Dashboard"
                                />
      <p className="text-xl font-semibold text-white max-w-6xl mx-auto max-w-6xl mx-auto"> Muestra los productos estrella basándose en el monto total recaudado.</p>

      {/* KPI */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded shadow-sm max-w-6xl mx-auto">
        <p className="text-sm font-medium text-indigo-800">Mejor Producto Actual</p>
        <p className="text-2xl font-bold text-indigo-900">
          {data.length > 0 ? data[0].producto_nombre : 'N/A'}
        </p>
      </div>

      <div className="mb-6 w-1/2 max-w-6xl mx-auto">
        <Search placeholder="Buscar producto..." />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow rounded-lg overflow-hidden max-w-6xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Vendido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% del Global</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={item.producto_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">#{idx + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.producto_nombre}</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">${item.monto_total_vendido}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.porcentaje_del_total}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}