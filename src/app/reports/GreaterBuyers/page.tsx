import { getGreaterBuyers } from '@/lib/data';
import Search from '@/app/components/Search';
import Pagination from '@/app/components/Pagination';
import Header from '@/app/components/Headder';

export default async function VIPBuyersPage(props: {
  searchParams?: Promise<{ query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const page = Number(searchParams?.page) || 1;
  
  const { data, totalPages, totalItems, error } = await getGreaterBuyers(query, page);

  return (
    
    <main className=" mx-auto">
<Header 
                title="Mejores Compradores" 
                backUrl="/" 
                backText="Volver al Dashboard"
              />
          <p className="text-xl font-semibold text-white max-w-6xl mx-auto">
            Clasificación de lealtad basada en la cantidad de órdenes completadas.</p>

      {/* KPI */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded shadow-sm max-w-6xl mx-auto">
        <p className="text-sm font-medium text-amber-800">Clientes Frecuentes Encontrados</p>
        <p className="text-2xl font-bold text-amber-900">{totalItems}</p>
      </div>

      <div className="mb-6 w-1/2 max-w-6xl mx-auto">
        <Search placeholder="Buscar por nombre o email..." />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6 max-w-6xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 ">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Órdenes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.usuario_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.usuario_nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.email}</td>
                <td className="px-6 py-4 text-sm font-bold text-indigo-600">{item.ordenes_count}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${item.nivel_lealtad === 'Cliente VIP' ? 'bg-amber-100 text-amber-800' : 
                      item.nivel_lealtad === 'Cliente Leal' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {item.nivel_lealtad}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination totalPages={totalPages} />
    </main>
  );
}