import { getStockCategories } from '@/lib/data';
import Header from '@/app/components/Headder';

export default async function StockCategoriesPage() {
  const { data, error } = await getStockCategories();

  return (
    <main className="">
      <Header 
                            title="Análisis de Stock por Categoría" 
                            backUrl="/" 
                            backText="Volver al Dashboard"
                          />
          <p className="text-xl font-semibold text-white max-w-6xl mx-auto">        Resumen de piezas totales y valor promedio de los productos.</p>

      {/* KPI */}
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded shadow-sm max-w-6xl mx-auto">
        <p className="text-sm font-medium text-emerald-800">Categoría con más unidades</p>
        <p className="text-2xl font-bold text-emerald-900">
          {data.length > 0 ? data[0].categoria : 'N/A'}
        </p>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow rounded-lg overflow-hidden max-w-6xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 ">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidades Totales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Promedio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ratio (Pzas/SKU)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.categoria}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.unidades_totales}</td>
                <td className="px-6 py-4 text-sm text-green-600">${item.precio_promedio_categoria}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.ratio_piezas_por_sku}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}