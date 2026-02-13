import { getUnsoldProducts } from '@/lib/data';
import Pagination from '@/app/components/Pagination';
import Header from '@/app/components/Headder';
export default async function UnsoldProductsPage(props: {
  searchParams?: Promise<{ page?: string }>
}) {  
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  
  const { data, totalPages, totalItems, error } = await getUnsoldProducts(page);

  return (
    <main className="">
      <Header 
                                        title="Top Productos Sin Ventas" 
                                        backUrl="/" 
                                        backText="Volver al Dashboard"
                                      />
      <p className="text-xl font-semibold text-white max-w-6xl mx-auto max-w-6xl mx-auto">Productos que nunca han sido incluidos en ninguna orden.</p>

      {/* KPI */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm max-w-6xl mx-auto">
        <p className="text-sm font-medium text-red-800">Total de Productos Inactivos</p>
        <p className="text-2xl font-bold text-red-900">{totalItems} productos</p>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6 max-w-6xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Físico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capital Estancado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.producto_id} className="hover:bg-red-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.producto_nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.stock} uds.</td>
                <td className="px-6 py-4 text-sm text-red-600 font-bold">${item.capital_estancado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination totalPages={totalPages} />
    </main>
  );
}