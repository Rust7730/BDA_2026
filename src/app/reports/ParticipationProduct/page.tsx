import { getProductParticipation } from '@/lib/data';
import Search from '@/app/components/Search';
import Header from '@/app/components/Headder';
export default async function ProductParticipationPage(props: {
  searchParams?: Promise<{ query?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  
  const { data, error } = await getProductParticipation(query);

  return (
    <main className="">
      <Header 
                      title="Participación de Ventas por Producto" 
                      backUrl="/" 
                      backText="Volver al Dashboard"
                    />
          <p className="text-xl font-semibold text-white max-w-6xl mx-auto"
      >Evalúa qué porcentaje de las ventas de su categoría representa cada producto.</p>

      {/* KPI */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded shadow-sm max-w-6xl mx-auto">
        <p className="text-sm font-medium text-blue-800">Productos Estrellas Totales</p>
        <p className="text-2xl font-bold text-blue-900">
          {data.filter(i => i.clasificacion === 'Producto Estrella').length}
        </p>
      </div>

      <div className="mb-6 w-1/2 max-w-6xl mx-auto">
        <Search placeholder="Buscar por producto o categoría..." />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow rounded-lg overflow-hidden max-w-6xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ventas ($)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Participación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.producto_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{item.categoria}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.producto_nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${item.ventas_producto}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.participacion_pct}%</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${item.clasificacion === 'Producto Estrella' ? 'bg-yellow-100 text-yellow-800' : 
                      item.clasificacion === 'Producto Medio' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {item.clasificacion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}